// Repository'nin tarayıcı içi uygulaması. Sunucudaki core use-case'lerinin aynısını
// @lokale/domain fonksiyonlarıyla yapar. Mock hile yapmaz: async, ID/zaman burada üretilir,
// hatalar RepoError olarak fırlatılır (ADR-003).
import {
  RepoError,
  askQuestionInput,
  channel,
  rateAnswerInput,
  reportInput,
  settingsPatch,
  submitAnswerInput,
  type Answer,
  type ArchivedAnswer,
  type Assignment,
  type AssignmentWithLocal,
  type Channel,
  type Id,
  type LocalSummary,
  type Notification,
  type NotificationKind,
  type Question,
  type QuestionSummary,
  type SystemMessage,
  type SystemMessageKind,
  type ThreadItem,
  type User,
} from "@lokale/contracts";
import {
  DEMO_CONFIG,
  MINUTE,
  computeLocalStats,
  deadlineFor,
  findSimilar,
  formatEta,
  isExpired,
  messages,
  pickNextLocal,
  planNextStep,
  type Candidate,
  type Config,
} from "@lokale/domain";
import type { z } from "zod";
import type { DemoControls, Repository } from "../repository";
import { currentUser } from "./mock-auth";
import { getStore, type MockState } from "./store";

type Touch = (c: Channel) => void;
const store = () => getStore();

// ---------- yardımcılar ----------

function parse<T>(schema: z.ZodType<T>, input: unknown): T {
  const r = schema.safeParse(input);
  if (!r.success) throw new RepoError("VALIDATION", r.error.issues[0]?.message ?? "Geçersiz girdi.");
  return r.data;
}

function cfgOf(s: MockState): Config {
  return { ...DEMO_CONFIG, reassignAfterMinutes: s.reassignAfterMinutes };
}

function startOfDay(now: number): number {
  const d = new Date(now);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function userById(s: MockState, id: Id): User {
  const u = s.users.find((x) => x.id === id);
  if (!u) throw new RepoError("NOT_FOUND", "Kullanıcı bulunamadı.");
  return u;
}

function statsOf(s: MockState, localId: Id, now: number) {
  return computeLocalStats(localId, s.assignments, s.answers, s.ratings, now, cfgOf(s));
}

function summary(s: MockState, u: User, now: number): LocalSummary {
  return {
    id: u.id,
    name: u.name,
    color: u.color,
    avatarUrl: u.avatarUrl,
    homeCity: u.homeCity,
    homeDistrict: u.homeDistrict,
    verified: u.verified,
    medianResponseMinutes: statsOf(s, u.id, now).medianResponseMinutes,
  };
}

function assignedToday(s: MockState, localId: Id, now: number): number {
  const from = startOfDay(now);
  return s.assignments.filter((a) => a.localId === localId && a.assignedAt >= from && a.assignedAt <= now).length;
}

function candidates(s: MockState, now: number): Candidate[] {
  return s.users.map((user) => ({ user, stats: statsOf(s, user.id, now), assignedToday: assignedToday(s, user.id, now) }));
}

function addMessage(s: MockState, q: Question, kind: SystemMessageKind, text: string, now: number, touch: Touch) {
  const m: SystemMessage = { id: store().nextId(s, "m"), questionId: q.id, kind, text, createdAt: now };
  s.messages.push(m);
  touch(channel.question(q.id));
}

function notify(
  s: MockState,
  userId: Id,
  kind: NotificationKind,
  q: Question,
  text: string,
  actor: LocalSummary | null,
  now: number,
  touch: Touch,
) {
  const n: Notification = { id: store().nextId(s, "n"), userId, kind, actor, questionId: q.id, text, read: false, createdAt: now };
  s.notifications.push(n);
  touch(channel.notifications(userId));
}

function withLocal(s: MockState, a: Assignment, now: number): AssignmentWithLocal {
  return { ...a, local: summary(s, userById(s, a.localId), now) };
}

function questionSummary(s: MockState, q: Question, now: number): QuestionSummary {
  const cur = q.currentAssignmentId ? s.assignments.find((a) => a.id === q.currentAssignmentId) : undefined;
  return { question: q, currentAssignment: cur && cur.status === "pending" ? withLocal(s, cur, now) : null };
}

function usefulCount(s: MockState, answerId: Id): number {
  return s.ratings.filter((r) => r.answerId === answerId && r.useful === true).length + (s.usefulBoost[answerId] ?? 0);
}

function archivedAnswers(s: MockState, now: number, filter: (q: Question, a: Answer) => boolean): ArchivedAnswer[] {
  const out: ArchivedAnswer[] = [];
  for (const a of s.answers) {
    if (!a.archived) continue;
    const q = s.questions.find((x) => x.id === a.questionId);
    if (!q || !filter(q, a)) continue;
    out.push({
      questionId: q.id,
      questionText: q.text,
      topic: q.topic,
      budget: q.budget,
      district: q.district,
      answer: a,
      local: summary(s, userById(s, a.localId), now),
      usefulCount: usefulCount(s, a.id),
    });
  }
  return out;
}

// ---------- çekirdek akışlar (Faz 2'de packages/core karşılığı) ----------

/** Sıradaki uygun lokale atar; yoksa açık havuz. assignNext + closeAndReassign'in ortak parçası. */
function assignNext(s: MockState, q: Question, now: number, touch: Touch, prev: User | null) {
  const cfg = cfgOf(s);
  const excluded = s.assignments.filter((a) => a.questionId === q.id).map((a) => a.localId);
  const next = pickNextLocal(q, candidates(s, now), excluded, cfg);
  const step = planNextStep(q, next, cfg);

  if (step.action === "open_pool" || !next) {
    q.status = "open_pool";
    q.currentAssignmentId = null;
    addMessage(s, q, "open_pool", messages.openPool(), now, touch);
    return;
  }

  const local = next.user;
  const a: Assignment = {
    id: store().nextId(s, "a"),
    questionId: q.id,
    localId: local.id,
    attempt: q.attemptCount + 1,
    assignedAt: now,
    deadline: deadlineFor(now, cfg),
    status: "pending",
    resolvedAt: null,
  };
  s.assignments.push(a);
  q.attemptCount = a.attempt;
  q.currentAssignmentId = a.id;
  q.status = "assigned";

  const eta = formatEta(next.stats.medianResponseMinutes);
  const localSum = summary(s, local, now);
  if (prev) {
    addMessage(s, q, "reassigned", messages.reassigned(prev.name, local.name, eta), now, touch);
    notify(s, q.touristId, "question_reassigned", q, messages.notifyQuestionReassigned(local.name), localSum, now, touch);
  } else {
    addMessage(s, q, "assigned", messages.assigned(local.name, eta), now, touch);
    notify(s, q.touristId, "question_assigned", q, messages.notifyQuestionAssigned(local.name), localSum, now, touch);
  }
  notify(s, local.id, "new_question", q, messages.localNewQuestion(q.topic, q.district, cfg.reassignAfterMinutes), null, now, touch);
  touch(channel.inbox(local.id));
}

/** Süre dolması ya da "Bilmiyorum": idempotent (atama artık pending değilse hiçbir şey yapmaz). */
function closeAndReassign(s: MockState, assignmentId: Id, reason: "expired" | "declined", now: number, touch: Touch) {
  const a = s.assignments.find((x) => x.id === assignmentId);
  if (!a || a.status !== "pending") return;
  const q = s.questions.find((x) => x.id === a.questionId);
  if (!q) return;
  a.status = reason;
  a.resolvedAt = now;
  const prev = userById(s, a.localId);
  touch(channel.inbox(prev.id));
  if (reason === "expired") {
    notify(s, prev.id, "assignment_expired", q, messages.localAssignmentExpired(), null, now, touch);
  }
  assignNext(s, q, now, touch, prev);
}

function expireDue(s: MockState, now: number, touch: Touch) {
  for (const a of [...s.assignments]) {
    if (isExpired(a, now)) closeAndReassign(s, a.id, "expired", now, touch);
  }
}

// ---------- Repository ----------

export const mockRepository: Repository = {
  async findSimilarAnswers(q) {
    const s = store().read();
    const now = store().now();
    const pool = archivedAnswers(s, now, (qq) => qq.city === q.city);
    return findSimilar(q.text, pool, (e) => e.questionText, 3);
  },

  async listPopular(q) {
    const s = store().read();
    const now = store().now();
    const items = archivedAnswers(
      s,
      now,
      (qq) => qq.city === q.city && (!q.topic || qq.topic === q.topic) && (!q.budget || qq.budget === q.budget),
    ).sort((a, b) => b.usefulCount - a.usefulCount);
    return { items: items.slice(0, 8), nextCursor: null };
  },

  async listAvailableLocals(city) {
    const me = currentUser();
    const s = store().read();
    const now = store().now();
    return s.users
      .filter((u) => u.homeCity === city && u.id !== me.id && assignedToday(s, u.id, now) < u.dailyLimit)
      .map((u) => summary(s, u, now))
      .filter((l) => l.medianResponseMinutes !== null)
      .sort((a, b) => (a.medianResponseMinutes ?? 999) - (b.medianResponseMinutes ?? 999))
      .slice(0, 5);
  },

  async askQuestion(input) {
    const me = currentUser();
    const data = parse(askQuestionInput, input);
    return store().transact((s, now, touch) => {
      const q: Question = {
        id: store().nextId(s, "q"),
        touristId: me.id,
        city: data.city,
        district: data.district,
        text: data.text,
        topic: data.topic,
        budget: data.budget,
        status: "pending",
        attemptCount: 0,
        currentAssignmentId: null,
        createdAt: now,
      };
      s.questions.push(q);
      assignNext(s, q, now, touch, null);
      touch(channel.notifications(me.id));
      return questionSummary(s, q, now);
    });
  },

  async listMyQuestions() {
    const me = currentUser();
    const s = store().read();
    const now = store().now();
    return s.questions
      .filter((q) => q.touristId === me.id)
      .sort((a, b) => b.createdAt - a.createdAt)
      .map((q) => questionSummary(s, q, now));
  },

  async getQuestionThread(questionId) {
    const me = currentUser();
    const s = store().read();
    const now = store().now();
    const q = s.questions.find((x) => x.id === questionId);
    if (!q) throw new RepoError("NOT_FOUND", "Soru bulunamadı.");
    const asker = userById(s, q.touristId);
    const isAssignee = s.assignments.some((a) => a.questionId === q.id && a.localId === me.id);
    if (q.touristId !== me.id && !isAssignee) throw new RepoError("FORBIDDEN", "Bu soruyu göremezsin.");

    const items: ThreadItem[] = [
      ...s.messages.filter((m) => m.questionId === q.id).map((message) => ({ type: "system" as const, message })),
      ...s.answers
        .filter((a) => a.questionId === q.id)
        .map((answer) => ({ type: "answer" as const, answer, local: summary(s, userById(s, answer.localId), now) })),
    ].sort((a, b) => at(a) - at(b));

    const assignments = s.assignments
      .filter((a) => a.questionId === q.id)
      .sort((a, b) => a.attempt - b.attempt)
      .map((a) => withLocal(s, a, now));
    const answerIds = new Set(s.answers.filter((a) => a.questionId === q.id).map((a) => a.id));

    return {
      question: q,
      asker: { name: asker.name, color: asker.color },
      items,
      assignments,
      currentAssignment: assignments.find((a) => a.id === q.currentAssignmentId && a.status === "pending") ?? null,
      myRating: s.ratings.find((r) => answerIds.has(r.answerId) && r.touristId === me.id) ?? null,
    };
  },

  async rateAnswer(input) {
    const me = currentUser();
    const data = parse(rateAnswerInput, input);
    return store().transact((s, now, touch) => {
      const answer = s.answers.find((a) => a.id === data.answerId);
      if (!answer) throw new RepoError("NOT_FOUND", "Cevap bulunamadı.");
      const q = s.questions.find((x) => x.id === answer.questionId)!;
      if (q.touristId !== me.id) throw new RepoError("FORBIDDEN", "Sadece soruyu soran değerlendirebilir.");
      if (s.ratings.some((r) => r.answerId === answer.id && r.touristId === me.id)) {
        throw new RepoError("ALREADY_RATED", "Bu cevabı zaten değerlendirdin.");
      }
      const rating = {
        id: store().nextId(s, "r"),
        answerId: answer.id,
        touristId: me.id,
        useful: data.useful,
        upToDate: data.upToDate,
        trustworthy: data.trustworthy,
        createdAt: now,
      };
      s.ratings.push(rating);
      touch(channel.question(q.id));
      if (data.useful) {
        notify(s, answer.localId, "answer_rated", q, messages.answerRated(me.name), summary(s, me, now), now, touch);
      }
      return { rating, localScore: statsOf(s, answer.localId, now).localScore };
    });
  },

  async getInbox() {
    const me = currentUser();
    const s = store().read();
    const now = store().now();
    const from = startOfDay(now);
    const pending = s.assignments
      .filter((a) => a.localId === me.id && a.status === "pending" && a.deadline > now)
      .sort((a, b) => a.deadline - b.deadline)
      .map((assignment) => {
        const question = s.questions.find((q) => q.id === assignment.questionId)!;
        const tourist = userById(s, question.touristId);
        return { assignment, question, touristName: tourist.name, touristColor: tourist.color };
      });
    const answeredToday = s.answers
      .filter((a) => a.localId === me.id && a.createdAt >= from)
      .sort((a, b) => b.createdAt - a.createdAt)
      .map((answer) => {
        const question = s.questions.find((q) => q.id === answer.questionId)!;
        const asg = s.assignments.find((x) => x.questionId === question.id && x.localId === me.id && x.status === "answered");
        return {
          question,
          answer,
          touristName: userById(s, question.touristId).name,
          responseMinutes: asg ? Math.max(1, Math.round((answer.createdAt - asg.assignedAt) / MINUTE)) : 0,
        };
      });
    return { pending, answeredToday, capacity: { used: assignedToday(s, me.id, now), limit: me.dailyLimit } };
  },

  async submitAnswer(input) {
    const me = currentUser();
    const data = parse(submitAnswerInput, input);
    return store().transact((s, now, touch) => {
      const a = s.assignments.find((x) => x.id === data.assignmentId);
      if (!a) throw new RepoError("NOT_FOUND", "Atama bulunamadı.");
      if (a.localId !== me.id) throw new RepoError("FORBIDDEN", "Bu soru sana atanmamış.");
      if (a.status !== "pending") throw new RepoError("ASSIGNMENT_CLOSED", "Bu soru artık sende değil.");
      if (a.deadline <= now) throw new RepoError("ASSIGNMENT_EXPIRED", "Süre doldu, soru sıradaki lokale geçti.");
      const q = s.questions.find((x) => x.id === a.questionId)!;
      const answer: Answer = {
        id: store().nextId(s, "ans"),
        questionId: q.id,
        localId: me.id,
        text: data.text,
        templateId: data.templateId,
        archived: data.archive,
        createdAt: now,
      };
      s.answers.push(answer);
      a.status = "answered";
      a.resolvedAt = now;
      q.status = "answered";
      addMessage(s, q, "answered", messages.answered(me.name), now, touch);
      notify(s, q.touristId, "answer_received", q, messages.notifyAnswerReceived(me.name), summary(s, me, now), now, touch);
      touch(channel.inbox(me.id));
      return answer;
    });
  },

  async declineAssignment(assignmentId) {
    const me = currentUser();
    await store().transact((s, now, touch) => {
      const a = s.assignments.find((x) => x.id === assignmentId);
      if (!a) throw new RepoError("NOT_FOUND", "Atama bulunamadı.");
      if (a.localId !== me.id) throw new RepoError("FORBIDDEN", "Bu soru sana atanmamış.");
      if (a.status !== "pending") throw new RepoError("ASSIGNMENT_CLOSED", "Bu soru artık sende değil.");
      closeAndReassign(s, a.id, "declined", now, touch);
    });
  },

  async listMyArchive() {
    const me = currentUser();
    const s = store().read();
    const now = store().now();
    return s.answers
      .filter((a) => a.localId === me.id && a.text !== "(geçmiş cevap)")
      .sort((a, b) => b.createdAt - a.createdAt)
      .map((a) => {
        const q = s.questions.find((x) => x.id === a.questionId)!;
        return {
          questionId: q.id,
          questionText: q.text,
          topic: q.topic,
          budget: q.budget,
          district: q.district,
          answer: a,
          local: summary(s, me, now),
          usefulCount: usefulCount(s, a.id),
        };
      });
  },

  async setArchived(answerId, archived) {
    const me = currentUser();
    await store().transact((s, _now, touch) => {
      const a = s.answers.find((x) => x.id === answerId);
      if (!a) throw new RepoError("NOT_FOUND");
      if (a.localId !== me.id) throw new RepoError("FORBIDDEN");
      a.archived = archived;
      touch(channel.question(a.questionId));
    });
  },

  async getLocalProfile(localId) {
    const s = store().read();
    const now = store().now();
    const u = userById(s, localId);
    return {
      ...summary(s, u, now),
      stats: statsOf(s, u.id, now),
      topics: u.interests,
      recentAnswers: archivedAnswers(s, now, (_q, a) => a.localId === u.id)
        .sort((a, b) => b.answer.createdAt - a.answer.createdAt)
        .slice(0, 3),
    };
  },

  async listNotifications() {
    const me = currentUser();
    return store()
      .read()
      .notifications.filter((n) => n.userId === me.id)
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 30);
  },

  async markNotificationsRead(ids) {
    const me = currentUser();
    await store().transact((s, _now, touch) => {
      for (const n of s.notifications) {
        if (n.userId === me.id && (!ids || ids.includes(n.id))) n.read = true;
      }
      touch(channel.notifications(me.id));
    });
  },

  async updateSettings(patch) {
    const me = currentUser();
    const data = parse(settingsPatch, patch);
    return store().transact((s, _now, touch) => {
      const u = userById(s, me.id);
      if (data.dailyLimit !== undefined) u.dailyLimit = data.dailyLimit;
      if (data.homeDistrict !== undefined) u.homeDistrict = data.homeDistrict;
      if (data.interests !== undefined) u.interests = data.interests;
      touch(channel.inbox(me.id));
      return { ...u };
    });
  },

  async report(input) {
    const me = currentUser();
    const data = parse(reportInput, input);
    await store().transact((s, now) => {
      s.reports.push({ id: store().nextId(s, "rep"), reporterId: me.id, ...data, status: "open", createdAt: now });
    });
  },

  subscribe(ch, cb) {
    return store().subscribe(ch, cb);
  },
};

function at(i: ThreadItem): number {
  return i.type === "system" ? i.message.createdAt : i.answer.createdAt;
}

// ---------- Demo kontrolleri ----------

export const mockDemoControls: DemoControls = {
  async resetDemo() {
    await store().reset();
  },
  async advanceTime(ms) {
    await store().transact((s, _now, touch) => {
      s.offsetMs += ms;
      expireDue(s, Date.now() + s.offsetMs, touch);
    });
  },
  async setReassignAfterMinutes(minutes) {
    await store().transact((s) => {
      s.reassignAfterMinutes = Math.max(1, Math.round(minutes));
    });
  },
  async runScheduler() {
    await runExpireDue();
  },
  async getDebugState() {
    const s = store().read();
    const now = store().now();
    return {
      now,
      offsetMs: s.offsetMs,
      reassignAfterMinutes: s.reassignAfterMinutes,
      assignments: s.assignments
        .filter((a) => a.assignedAt >= startOfDay(now) || a.status === "pending")
        .sort((a, b) => b.assignedAt - a.assignedAt)
        .slice(0, 20)
        .map((a) => ({
          id: a.id,
          questionText: s.questions.find((q) => q.id === a.questionId)?.text ?? "",
          localName: userById(s, a.localId).name,
          attempt: a.attempt,
          status: a.status,
          deadline: a.deadline,
        })),
    };
  },
};

/** Zamanlayıcının çağırdığı iş (worker'daki sweep-expired karşılığı). Sadece yazma gerekiyorsa kilit alır. */
export async function runExpireDue(): Promise<void> {
  const s = store().read();
  const now = store().now();
  if (!s.assignments.some((a) => isExpired(a, now))) return;
  await store().transact((st, n, touch) => expireDue(st, n, touch));
}
