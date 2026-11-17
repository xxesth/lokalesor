// Atama çekirdeği (ADR-020, ADR-026). api (askQuestion, decline) ve worker (süre dolması, yedek tarama)
// aynı fonksiyonları çağırır. Kurallar @lokale/domain'de; burada transaction, kilit ve yan etkiler var.
//
// Eşzamanlılık:
// - Soru satırı FOR UPDATE ile kilitlenir: aynı soruya iki atama aynı anda yapılamaz.
// - Aday lokal FOR UPDATE SKIP LOCKED ile kilitlenir, kapasitesi kilit altında yeniden sayılır:
//   iki soru aynı anda aynı lokalin son kapasitesini alamaz; kilitli aday beklenmez, sıradakine geçilir.
// - Atama kapatma FOR UPDATE SKIP LOCKED + "hâlâ pending mi?" kontrolü: aynı süre işi iki kez
//   (BullMQ + yedek tarama, iki worker) çalışsa da tek kez işlenir (idempotent).
import { RepoError, channel, type Assignment, type Id, type LocalStats, type Question } from "@lokale/contracts";
import { assignments, blocks, questions, users } from "@lokale/db";
import {
  deadlineFor,
  formatEta,
  messages,
  planNextStep,
  rankCandidates,
  filterEligible,
  type Candidate,
} from "@lokale/domain";
import { and, asc, eq, lte, ne, notInArray, or, sql } from "drizzle-orm";
import type { CoreContext } from "./context";
import { newId } from "./ids";
import { toAssignment, toQuestion, toUser } from "./mappers";
import { withTx, type Tx } from "./tx";
import { addSystemMessage, notify } from "./writes";

export type AssignResult = { action: "assigned"; assignment: Assignment } | { action: "open_pool" };
export type CloseReason = "expired" | "declined";

/** "Bugün"ün başlangıcı (cfg saat dilimine göre), SQL ifadesi. */
const dayStart = (tx: Tx) =>
  sql`(date_trunc('day', ${new Date(tx.now)}::timestamptz AT TIME ZONE ${tx.tz}) AT TIME ZONE ${tx.tz})`;

/**
 * Dış sorgudaki `users` satırı için bugünkü atama sayısı.
 * Dikkat: drizzle `${users.id}`'yi alt sorguda tablo adı olmadan ("id") yazar ve bu `a.id`'ye çözülür;
 * bu yüzden dış kolon açıkça `users.id` diye yazılır.
 */
const assignedTodaySql = (tx: Tx) =>
  sql<number>`(select count(*)::int from assignments a
    where a.local_id = users.id and a.assigned_at >= ${dayStart(tx)} and a.assigned_at <= ${new Date(tx.now)})`;

/** Engel iki yönlü: turistin engellediği ve turisti engelleyen kişiler. */
export async function blockedWith(tx: Tx, userId: Id): Promise<Id[]> {
  const rows = await tx.db
    .select({ blockerId: blocks.blockerId, blockedId: blocks.blockedId })
    .from(blocks)
    .where(or(eq(blocks.blockerId, userId), eq(blocks.blockedId, userId)));
  return rows.map((r) => (r.blockerId === userId ? r.blockedId : r.blockerId));
}

/**
 * Şehirdeki aday lokaller + eşleştirme için gereken istatistik (medyan süre) ve bugünkü atama sayısı.
 * Not: local_stats materialized view gelince medyan oradan okunur (todo: Fatih).
 */
async function loadCandidates(tx: Tx, q: Question, excluded: Id[]): Promise<Candidate[]> {
  const since = new Date(tx.now - tx.cfg.statsWindowDays * 86_400_000);
  const rows = await tx.db
    .select({
      user: users,
      assignedToday: assignedTodaySql(tx),
      median: sql<number | null>`(select percentile_cont(0.5) within group (order by extract(epoch from (a.resolved_at - a.assigned_at)) / 60)
        from assignments a where a.local_id = users.id and a.status = 'answered' and a.assigned_at >= ${since})`,
    })
    .from(users)
    .where(and(eq(users.homeCity, q.city), ne(users.id, q.touristId), excluded.length ? notInArray(users.id, excluded) : undefined));

  return rows.map((r) => {
    // Eşleştirme sadece medyan süreyi kullanır; diğer alanlar burada hesaplanmaz.
    const stats: LocalStats = {
      userId: r.user.id,
      medianResponseMinutes: r.median === null ? null : Math.round(Number(r.median)),
      responseRate: null,
      localScore: null,
      answeredCount: 0,
      ratedCount: 0,
    };
    return { user: toUser(r.user), stats, assignedToday: Number(r.assignedToday) };
  });
}

/** Sıralı adaylardan ilk kilitlenebilen ve kilit altında kapasitesi hâlâ olanı seçer. */
async function lockFirstAvailable(tx: Tx, ranked: Candidate[]): Promise<Candidate | null> {
  for (const c of ranked) {
    const [row] = await tx.db
      .select({ id: users.id, dailyLimit: users.dailyLimit, assignedToday: assignedTodaySql(tx) })
      .from(users)
      .where(eq(users.id, c.user.id))
      .for("update", { skipLocked: true });
    if (row && Number(row.assignedToday) < row.dailyLimit) return c;
  }
  return null;
}

/**
 * Soruyu sıradaki uygun lokale atar; deneme sınırı aşıldıysa ya da aday yoksa açık havuza alır.
 * Çağıran aynı transaction içindedir (askQuestion: yeni soru; closeAndReassign: önceki atama kapandı).
 * @param prev önceki lokal (yeniden atamada mesaj metni için), ilk atamada null
 */
export async function assignNext(tx: Tx, questionId: Id, prev: { id: Id; name: string } | null): Promise<AssignResult> {
  const [qRow] = await tx.db.select().from(questions).where(eq(questions.id, questionId)).for("update");
  if (!qRow) throw new RepoError("NOT_FOUND", "Soru bulunamadı.");
  const q = toQuestion(qRow);

  const previous = await tx.db.select({ localId: assignments.localId }).from(assignments).where(eq(assignments.questionId, q.id));
  const excluded = [...new Set([...previous.map((p) => p.localId), ...(await blockedWith(tx, q.touristId))])];

  const ranked = rankCandidates(q, filterEligible(q, await loadCandidates(tx, q, excluded), excluded), tx.cfg);
  const next = q.attemptCount >= tx.cfg.maxAttempts ? null : await lockFirstAvailable(tx, ranked);
  const step = planNextStep(q, next, tx.cfg);

  if (step.action === "open_pool" || !next) {
    await tx.db
      .update(questions)
      .set({ status: "open_pool", currentAssignmentId: null, pooledAt: new Date(tx.now) })
      .where(eq(questions.id, q.id));
    await addSystemMessage(tx, q.id, "open_pool", messages.openPool());
    tx.publish(channel.pool(q.city));
    return { action: "open_pool" };
  }

  const local = next.user;
  const assignment: Assignment = {
    id: newId(),
    questionId: q.id,
    localId: local.id,
    attempt: q.attemptCount + 1,
    assignedAt: tx.now,
    deadline: deadlineFor(tx.now, tx.cfg),
    status: "pending",
    resolvedAt: null,
  };
  await tx.db.insert(assignments).values({
    ...assignment,
    assignedAt: new Date(assignment.assignedAt),
    deadline: new Date(assignment.deadline),
    resolvedAt: null,
  });
  await tx.db
    .update(questions)
    .set({ status: "assigned", attemptCount: assignment.attempt, currentAssignmentId: assignment.id })
    .where(eq(questions.id, q.id));

  const eta = formatEta(next.stats.medianResponseMinutes);
  if (prev) {
    await addSystemMessage(tx, q.id, "reassigned", messages.reassigned(prev.name, local.name, eta));
    await notify(tx, { userId: q.touristId, kind: "question_reassigned", questionId: q.id, text: messages.notifyQuestionReassigned(local.name), actorId: local.id });
  } else {
    await addSystemMessage(tx, q.id, "assigned", messages.assigned(local.name, eta));
    await notify(tx, { userId: q.touristId, kind: "question_assigned", questionId: q.id, text: messages.notifyQuestionAssigned(local.name), actorId: local.id });
  }
  await notify(tx, {
    userId: local.id,
    kind: "new_question",
    questionId: q.id,
    text: messages.localNewQuestion(q.topic, q.district, tx.cfg.reassignAfterMinutes),
    actorId: null,
  });
  tx.publish(channel.inbox(local.id));
  tx.publish(channel.question(q.id));
  tx.scheduleDeadline({ assignmentId: assignment.id, deadline: assignment.deadline });
  return { action: "assigned", assignment };
}

/** Kilitli, pending bir atamayı kapatıp sıradakine geçer. */
async function closeLocked(tx: Tx, a: Assignment, reason: CloseReason): Promise<AssignResult> {
  await tx.db.update(assignments).set({ status: reason, resolvedAt: new Date(tx.now) }).where(eq(assignments.id, a.id));
  const [prev] = await tx.db.select({ id: users.id, name: users.name }).from(users).where(eq(users.id, a.localId));
  tx.publish(channel.inbox(a.localId));
  if (reason === "expired") {
    await notify(tx, { userId: a.localId, kind: "assignment_expired", questionId: a.questionId, text: messages.localAssignmentExpired(), actorId: null });
  }
  return assignNext(tx, a.questionId, prev ?? null);
}

/**
 * Süre dolması (worker) için. Idempotent: atama yoksa, artık pending değilse, başka bir süreç kilitliyse
 * ya da süresi henüz dolmamışsa hiçbir şey yapmaz ve null döner.
 */
export async function closeAndReassign(ctx: CoreContext, assignmentId: Id, reason: CloseReason): Promise<AssignResult | null> {
  return withTx(ctx, async (tx) => {
    const [row] = await tx.db
      .select()
      .from(assignments)
      .where(and(eq(assignments.id, assignmentId), eq(assignments.status, "pending")))
      .for("update", { skipLocked: true });
    if (!row) return null;
    const a = toAssignment(row);
    if (reason === "expired" && a.deadline > tx.now) return null;
    return closeLocked(tx, a, reason);
  });
}

/** "Bilmiyorum, sıradakine geçsin" (api: POST /api/assignments/:id/decline). Aktör oturumdan gelir. */
export async function declineAssignment(ctx: CoreContext, actorId: Id, assignmentId: Id): Promise<void> {
  await withTx(ctx, async (tx) => {
    const [row] = await tx.db.select().from(assignments).where(eq(assignments.id, assignmentId)).for("update");
    if (!row) throw new RepoError("NOT_FOUND", "Atama bulunamadı.");
    const a = toAssignment(row);
    if (a.localId !== actorId) throw new RepoError("FORBIDDEN", "Bu soru sana atanmamış.");
    if (a.status !== "pending") throw new RepoError("ASSIGNMENT_CLOSED", "Bu soru artık sende değil.");
    await closeLocked(tx, a, "declined");
  });
}

/**
 * Yedek tarama (worker, dakikada bir) ve dev "zamanı ileri sar". Kısmi index'i kullanır.
 * Her atama kendi transaction'ında kapanır; birden çok worker güvenle aynı anda çalışabilir.
 * @returns kapatılan atama sayısı
 */
export async function sweepExpired(ctx: CoreContext, limit = 200): Promise<number> {
  const { now } = await ctx.runtime.load();
  const due = await ctx.db
    .select({ id: assignments.id })
    .from(assignments)
    .where(and(eq(assignments.status, "pending"), lte(assignments.deadline, new Date(now))))
    .orderBy(asc(assignments.deadline))
    .limit(limit);
  let closed = 0;
  for (const { id } of due) {
    if (await closeAndReassign(ctx, id, "expired")) closed++;
  }
  return closed;
}
