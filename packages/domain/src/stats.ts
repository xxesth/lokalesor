import type { Answer, Assignment, Id, LocalStats, Rating, Timestamp } from "@lokale/contracts";
import { DAY, HOUR, MINUTE, type Config } from "./config";

export function median(values: number[]): number | null {
  if (values.length === 0) return null;
  const s = [...values].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid]! : (s[mid - 1]! + s[mid]!) / 2;
}

/**
 * Brief 2.2:
 * - Medyan yanıt süresi: son 30 günde cevaplanan atamaların atanma → cevap süresi.
 * - Yanıt oranı: son 30 günde atanan sorulardan 24 saat içinde cevaplananların oranı (Airbnb tanımı).
 * - Local Score: faydalı oy / değerlendirilmiş cevap × 100 (cevap sayısına değil, kaliteye bağlı).
 */
export function computeLocalStats(
  localId: Id,
  assignments: Assignment[],
  answers: Answer[],
  ratings: Rating[],
  now: Timestamp,
  cfg: Config,
): LocalStats {
  const since = now - cfg.statsWindowDays * DAY;
  const mine = assignments.filter((a) => a.localId === localId && a.assignedAt >= since);
  // Henüz süresi dolmamış bekleyen atamalar oranı bozmasın.
  const decided = mine.filter((a) => a.status !== "pending");
  const answeredAs = decided.filter((a) => a.status === "answered" && a.resolvedAt !== null);

  const minutes = answeredAs.map((a) => (a.resolvedAt! - a.assignedAt) / MINUTE);
  const med = median(minutes);
  const within = answeredAs.filter((a) => a.resolvedAt! - a.assignedAt <= cfg.responseRateWindowHours * HOUR);

  const myAnswerIds = new Set(answers.filter((a) => a.localId === localId).map((a) => a.id));
  const rated = ratings.filter((r) => myAnswerIds.has(r.answerId) && r.useful !== null);
  const useful = rated.filter((r) => r.useful === true);

  return {
    userId: localId,
    medianResponseMinutes: med === null ? null : Math.round(med),
    responseRate: decided.length ? within.length / decided.length : null,
    localScore: rated.length ? Math.round((useful.length / rated.length) * 100) : null,
    answeredCount: myAnswerIds.size,
    ratedCount: rated.length,
  };
}

/** "~20 dk" | "~2 sa" | null (veri yok). */
export function formatEta(medianMinutes: number | null): string | null {
  if (medianMinutes === null) return null;
  if (medianMinutes < 60) return `~${Math.max(1, Math.round(medianMinutes))} dk`;
  return `~${Math.round(medianMinutes / 60)} sa`;
}

export function formatRate(rate: number | null): string {
  return rate === null ? "—" : `%${Math.round(rate * 100)}`;
}
