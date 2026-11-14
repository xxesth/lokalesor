import type { LocalStats, Question, User } from "@lokale/contracts";
import type { Candidate } from "./matching";

export const NOW = Date.UTC(2026, 10, 14, 16, 0, 0);

export function user(p: Partial<User> & { id: string }): User {
  return {
    name: p.id, color: "kobalt", avatarUrl: null, homeCity: "istanbul", homeDistrict: null,
    interests: [], verified: true, dailyLimit: 2, createdAt: 0, ...p,
  };
}

export function stats(userId: string, medianResponseMinutes: number | null): LocalStats {
  return { userId, medianResponseMinutes, responseRate: null, localScore: null, answeredCount: 0, ratedCount: 0 };
}

export function cand(u: User, median: number | null, assignedToday = 0): Candidate {
  return { user: u, stats: stats(u.id, median), assignedToday };
}

export function question(p: Partial<Question> = {}): Question {
  return {
    id: "q1", touristId: "elif", city: "istanbul", district: "kadikoy",
    text: "Kadıköy'de öğrenci bütçesine uygun, turistik olmayan bir akşam yemeği yeri?",
    topic: "local_food", budget: "low", status: "pending", attemptCount: 0, currentAssignmentId: null,
    createdAt: NOW, ...p,
  };
}
