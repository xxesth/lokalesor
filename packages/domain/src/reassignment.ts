import type { Assignment, Id, Question, Timestamp } from "@lokale/contracts";
import type { Config } from "./config";
import type { Candidate } from "./matching";

export function isExpired(a: Pick<Assignment, "status" | "deadline">, now: Timestamp): boolean {
  return a.status === "pending" && a.deadline <= now;
}

export type NextStep = { action: "reassign"; localId: Id } | { action: "open_pool" };

/**
 * Süre dolduğunda ya da lokal "Bilmiyorum" dediğinde sıradaki adım.
 * Deneme sınırı aşıldıysa veya uygun lokal yoksa soru açık havuza düşer.
 */
export function planNextStep(q: Pick<Question, "attemptCount">, next: Candidate | null, cfg: Config): NextStep {
  if (q.attemptCount >= cfg.maxAttempts || next === null) return { action: "open_pool" };
  return { action: "reassign", localId: next.user.id };
}

export function deadlineFor(assignedAt: Timestamp, cfg: Config): Timestamp {
  return assignedAt + cfg.reassignAfterMinutes * 60_000;
}
