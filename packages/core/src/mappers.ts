// Veritabanı satırı → sözleşme tipi. Zamanlar Date → epoch ms. E-posta hiçbir zaman dışarı çıkmaz.
import type { Assignment, Question, User } from "@lokale/contracts";
import type { assignments, questions, users } from "@lokale/db";

type UserRow = typeof users.$inferSelect;
type QuestionRow = typeof questions.$inferSelect;
type AssignmentRow = typeof assignments.$inferSelect;

const ms = (d: Date) => d.getTime();
const msOrNull = (d: Date | null) => (d ? d.getTime() : null);

export function toUser(r: UserRow): User {
  return {
    id: r.id,
    name: r.name,
    color: r.color,
    avatarUrl: r.image,
    homeCity: r.homeCity,
    homeDistrict: r.homeDistrict,
    interests: r.interests,
    verified: r.verified,
    dailyLimit: r.dailyLimit,
    createdAt: ms(r.createdAt),
  };
}

export function toQuestion(r: QuestionRow): Question {
  return {
    id: r.id,
    touristId: r.touristId,
    city: r.city,
    district: r.district,
    text: r.text,
    topic: r.topic,
    budget: r.budget,
    status: r.status,
    attemptCount: r.attemptCount,
    currentAssignmentId: r.currentAssignmentId,
    createdAt: ms(r.createdAt),
  };
}

export function toAssignment(r: AssignmentRow): Assignment {
  return {
    id: r.id,
    questionId: r.questionId,
    localId: r.localId,
    attempt: r.attempt,
    assignedAt: ms(r.assignedAt),
    deadline: ms(r.deadline),
    status: r.status,
    resolvedAt: msOrNull(r.resolvedAt),
  };
}
