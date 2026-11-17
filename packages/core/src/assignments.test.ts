import { RepoError } from "@lokale/contracts";
import { assignments, blocks, notifications, questions, systemMessages } from "@lokale/db";
import { DEMO_CONFIG } from "@lokale/domain";
import { asc, eq, sql } from "drizzle-orm";
import { jwtVerify } from "jose";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { assignNext, closeAndReassign, declineAssignment, sweepExpired } from "./assignments";
import { newId } from "./ids";
import { signRealtimeToken } from "./realtime-token";
import { T0, createTestCore, dbAvailable, insertUser, resetDb, truncateAll, type TestCore } from "./test/harness";
import { withTx } from "./tx";

const ok = await dbAvailable();
const T = DEMO_CONFIG.reassignAfterMinutes * 60_000;

describe.skipIf(!ok)("assignments (gerçek Postgres)", () => {
  let t: TestCore;

  beforeAll(async () => {
    await resetDb();
    t = createTestCore();
  });
  afterAll(async () => t?.close());

  beforeEach(async () => {
    await truncateAll(t);
    t.clock.set({ now: T0, cfg: DEMO_CONFIG });
    // Senaryo: Kadıköy / Yerel yemek → Mert (konu + semt) 1., Nevin (konu) 2., Çağlar (uyumsuz) 3.
    await insertUser(t, { id: "efe", city: "ankara" });
    await insertUser(t, { id: "mert", district: "kadikoy", interests: ["local_food"] });
    await insertUser(t, { id: "nevin", district: "moda", interests: ["local_food"] });
    await insertUser(t, { id: "caglar", district: "beyoglu", interests: ["nightlife"] });
  });

  async function ask(touristId = "efe", text = "Kadıköy'de uygun bir akşam yemeği yeri?") {
    return withTx(t.ctx, async (tx) => {
      const id = newId();
      await tx.db.insert(questions).values({
        id, touristId, city: "istanbul", district: "kadikoy", text, topic: "local_food", budget: "low", createdAt: new Date(tx.now),
      });
      return { id, result: await assignNext(tx, id, null) };
    });
  }
  const assignmentsOf = (qid: string) =>
    t.handle.db.select().from(assignments).where(eq(assignments.questionId, qid)).orderBy(asc(assignments.attempt));

  it("en iyi adaya atar; mesaj, bildirim, yayın ve süre işi commit'ten sonra gider", async () => {
    const { id, result } = await ask();
    expect(result).toMatchObject({ action: "assigned", assignment: { localId: "mert", attempt: 1, deadline: T0 + T } });
    const [q] = await t.handle.db.select().from(questions).where(eq(questions.id, id));
    expect(q).toMatchObject({ status: "assigned", attemptCount: 1 });
    const msgs = await t.handle.db.select().from(systemMessages).where(eq(systemMessages.questionId, id));
    expect(msgs.map((m) => m.kind)).toEqual(["assigned"]);
    expect(msgs[0]!.text).toMatch(/^Sorun Mert'e iletildi\./);
    const notes = await t.handle.db.select().from(notifications);
    expect(notes.map((n) => [n.userId, n.kind]).sort()).toEqual([["efe", "question_assigned"], ["mert", "new_question"]]);

    expect(t.published).toHaveLength(1);
    expect(new Set(t.published[0])).toEqual(new Set([`question:${id}`, "notifications:efe", "notifications:mert", "inbox:mert"]));
    expect(t.scheduled).toEqual([{ assignmentId: (result as { assignment: { id: string } }).assignment.id, deadline: T0 + T }]);
  });

  it("rollback olursa hiçbir yayın ve kuyruk işi gitmez", async () => {
    await expect(
      withTx(t.ctx, async (tx) => {
        const id = newId();
        await tx.db.insert(questions).values({ id, touristId: "efe", city: "istanbul", district: null, text: "Rollback testi sorusu", topic: "route", budget: "low" });
        await assignNext(tx, id, null);
        throw new Error("boom");
      }),
    ).rejects.toThrow("boom");
    expect(t.published).toEqual([]);
    expect(t.scheduled).toEqual([]);
    expect(await t.handle.db.select().from(assignments)).toEqual([]);
  });

  it("süre dolunca sıradakine geçer; aynı iş ikinci kez ve süre dolmadan çalışırsa hiçbir şey yapmaz", async () => {
    const { id, result } = await ask();
    const first = (result as { assignment: { id: string } }).assignment.id;

    expect(await closeAndReassign(t.ctx, first, "expired")).toBeNull(); // süre dolmadı
    t.clock.set({ now: T0 + T + 1 });
    expect(await closeAndReassign(t.ctx, first, "expired")).toMatchObject({ action: "assigned", assignment: { localId: "nevin", attempt: 2 } });
    expect(await closeAndReassign(t.ctx, first, "expired")).toBeNull(); // idempotent

    expect((await assignmentsOf(id)).map((a) => [a.localId, a.status])).toEqual([["mert", "expired"], ["nevin", "pending"]]);
    const kinds = (await t.handle.db.select().from(systemMessages).where(eq(systemMessages.questionId, id)).orderBy(asc(systemMessages.createdAt))).map((m) => m.kind);
    expect(kinds).toEqual(["assigned", "reassigned"]);
  });

  it("deneme sınırı aşılınca açık havuz: pooledAt yazılır, pool kanalı yayınlanır", async () => {
    t.clock.set({ cfg: { ...DEMO_CONFIG, maxAttempts: 2 } });
    const { id } = await ask();
    t.clock.set({ now: T0 + T + 1 });
    await sweepExpired(t.ctx);
    t.clock.set({ now: T0 + 2 * T + 2 });
    expect(await sweepExpired(t.ctx)).toBe(1);
    const [q] = await t.handle.db.select().from(questions).where(eq(questions.id, id));
    expect(q).toMatchObject({ status: "open_pool", currentAssignmentId: null, attemptCount: 2 });
    expect(q!.pooledAt?.getTime()).toBe(T0 + 2 * T + 2);
    expect(t.published.at(-1)).toContain("pool:istanbul");
  });

  it("kapasitesi dolan ve engelli (iki yönlü) lokal atlanır", async () => {
    await insertUser(t, { id: "ali", city: "ankara" });
    // Mert'in kapasitesi 1 ve bugün bir soru almış
    await t.handle.db.execute(sql`update users set daily_limit = 1 where id = 'mert'`);
    await ask("ali", "Ali'nin ilk sorusu, Kadıköy'de yemek?");
    const second = await ask();
    expect(second.result).toMatchObject({ action: "assigned", assignment: { localId: "nevin" } });

    // Nevin, Efe'yi engellemiş → Efe'nin sorusu Nevin'e de gitmez
    await t.handle.db.insert(blocks).values({ blockerId: "nevin", blockedId: "efe" });
    const third = await ask("efe", "Üçüncü soru: Kadıköy'de yemek?");
    expect(third.result).toMatchObject({ action: "assigned", assignment: { localId: "caglar" } });
  });

  it("eşit uyumda geçmiş medyan yanıt süresi kısa olan öne geçer", async () => {
    await insertUser(t, { id: "hizli", district: "moda", interests: ["local_food"] });
    // Nevin geçmişte 100 dk, Hızlı 10 dk'da cevaplamış (dünkü atamalar, bugünkü kapasiteyi etkilemez)
    const old = await ask("efe", "Geçmiş soru: Moda'da kahvaltı?");
    const day = 86_400_000;
    await t.handle.db.delete(assignments).where(eq(assignments.questionId, old.id));
    for (const [localId, mins, attempt] of [["nevin", 100, 1], ["hizli", 10, 2]] as const) {
      const at = T0 - day;
      await t.handle.db.insert(assignments).values({
        id: newId(), questionId: old.id, localId, attempt, assignedAt: new Date(at), deadline: new Date(at + T),
        status: "answered", resolvedAt: new Date(at + mins * 60_000),
      });
    }
    await t.handle.db.execute(sql`update users set daily_limit = 0 where id = 'mert'`);
    const { result } = await ask();
    expect(result).toMatchObject({ assignment: { localId: "hizli" } });
    expect((await t.handle.db.select().from(systemMessages).orderBy(asc(systemMessages.createdAt))).at(-1)?.text).toMatch(/~10 dk/);
  });

  it("yarış: son kapasiteyi iki eşzamanlı soru alamaz", async () => {
    await t.handle.db.execute(sql`update users set daily_limit = 1`);
    await insertUser(t, { id: "ali", city: "ankara" });
    const [a, b] = await Promise.all([ask("efe", "Eşzamanlı soru bir, Kadıköy?"), ask("ali", "Eşzamanlı soru iki, Kadıköy?")]);
    const locals = [a, b].map((x) => (x.result.action === "assigned" ? x.result.assignment.localId : "pool"));
    expect(new Set(locals).size, JSON.stringify(locals)).toBe(2); // ikisi de Mert'e gidemez
    expect(locals).toContain("mert");
  });

  it("yarış: aynı süre işi iki worker'da aynı anda çalışınca tek kez işlenir", async () => {
    const { id, result } = await ask();
    const aid = (result as { assignment: { id: string } }).assignment.id;
    t.clock.set({ now: T0 + T + 1 });
    const results = await Promise.all([closeAndReassign(t.ctx, aid, "expired"), closeAndReassign(t.ctx, aid, "expired"), sweepExpired(t.ctx)]);
    expect((await assignmentsOf(id)).map((x) => x.status)).toEqual(["expired", "pending"]);
    expect(results.filter((r) => r !== null && r !== 0)).toHaveLength(1);
  });

  it("decline: sadece atanan lokal, sadece pending iken", async () => {
    const { id, result } = await ask();
    const aid = (result as { assignment: { id: string } }).assignment.id;
    await expect(declineAssignment(t.ctx, "nevin", aid)).rejects.toMatchObject({ code: "FORBIDDEN" });
    await declineAssignment(t.ctx, "mert", aid);
    await expect(declineAssignment(t.ctx, "mert", aid)).rejects.toBeInstanceOf(RepoError);
    expect((await assignmentsOf(id)).map((a) => [a.localId, a.status])).toEqual([["mert", "declined"], ["nevin", "pending"]]);
  });
});

describe("realtime token", () => {
  it("5 dk geçerli, sub = userId", async () => {
    const secret = "x".repeat(32);
    const now = Date.now();
    const { token, expiresAt } = await signRealtimeToken(secret, "efe", now);
    expect(expiresAt).toBe(now + 5 * 60_000);
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));
    expect(payload.sub).toBe("efe");
    await expect(signRealtimeToken("kisa", "efe")).rejects.toThrow();
  });
});
