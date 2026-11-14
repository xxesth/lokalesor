// Kural tabanlı soru–lokal eşleştirme (brief 2.2).
// Sıra: 1) aynı şehir 2) konu uyumu 3) semt uyumu 4) bugünkü kapasite 5) en kısa yanıt süresi.
import type { Id, LocalStats, Question, User } from "@lokale/contracts";
import type { Config } from "./config";

export interface Candidate {
  user: User;
  stats: LocalStats;
  /** bugün kendisine atanan soru sayısı */
  assignedToday: number;
}

/** Sert filtreler: aynı şehir, soran kişi değil, bu soruya daha önce atanmamış, kapasitesi dolmamış. */
export function filterEligible(q: Question, cands: Candidate[], excludedLocalIds: Id[]): Candidate[] {
  const excluded = new Set(excludedLocalIds);
  return cands.filter(
    (c) =>
      c.user.homeCity === q.city &&
      c.user.id !== q.touristId &&
      !excluded.has(c.user.id) &&
      c.assignedToday < c.user.dailyLimit,
  );
}

/** Hız puanı 0-1: 0 dk → 1, 120 dk ve üstü → 0; veri yoksa 0.25. */
export function speedScore(medianMinutes: number | null): number {
  if (medianMinutes === null) return 0.25;
  return Math.max(0, 1 - medianMinutes / 120);
}

export function matchScore(q: Question, c: Candidate, cfg: Config): number {
  const w = cfg.matchWeights;
  const topic = c.user.interests.includes(q.topic) ? 1 : 0;
  const district = q.district !== null && c.user.homeDistrict === q.district ? 1 : 0;
  return w.topic * topic + w.district * district + w.speed * speedScore(c.stats.medianResponseMinutes);
}

/** Puana göre azalan; eşitlikte id'ye göre (deterministik). */
export function rankCandidates(q: Question, cands: Candidate[], cfg: Config): Candidate[] {
  return [...cands]
    .map((c) => ({ c, s: matchScore(q, c, cfg) }))
    .sort((a, b) => b.s - a.s || a.c.user.id.localeCompare(b.c.user.id))
    .map((x) => x.c);
}

export function pickNextLocal(q: Question, cands: Candidate[], excluded: Id[], cfg: Config): Candidate | null {
  return rankCandidates(q, filterEligible(q, cands, excluded), cfg)[0] ?? null;
}
