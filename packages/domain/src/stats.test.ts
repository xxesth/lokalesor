import { describe, expect, it } from "vitest";
import type { Answer, Assignment, Rating } from "@lokale/contracts";
import { DEFAULT_CONFIG, DAY, MINUTE } from "./config";
import { computeLocalStats, formatEta, formatRate, median } from "./stats";
import { NOW } from "./fixtures.test-utils";

const as = (id: string, mins: number | null, status: Assignment["status"], ago = DAY): Assignment => ({
  id, questionId: id, localId: "z", attempt: 1, assignedAt: NOW - ago, deadline: NOW - ago + 30 * MINUTE,
  status, resolvedAt: mins === null ? (status === "pending" ? null : NOW - ago + 30 * MINUTE) : NOW - ago + mins * MINUTE,
});
const ans = (id: string): Answer => ({ id, questionId: id, localId: "z", text: "x", templateId: null, archived: false, createdAt: NOW });
const rate = (answerId: string, useful: boolean | null): Rating => ({
  id: `r${answerId}`, answerId, touristId: "t", useful, upToDate: null, trustworthy: null, createdAt: NOW,
});

describe("stats", () => {
  it("median", () => {
    expect(median([])).toBeNull();
    expect(median([3, 1, 2])).toBe(2);
    expect(median([1, 2, 3, 4])).toBe(2.5);
  });

  it("medyan süre, yanıt oranı ve Local Score", () => {
    const assignments = [
      as("1", 10, "answered"), as("2", 20, "answered"), as("3", 40, "answered"),
      as("4", null, "expired"), as("5", null, "pending"), as("old", 5, "answered", 40 * DAY),
    ];
    const answers = ["1", "2", "3"].map(ans);
    const ratings = [rate("1", true), rate("2", true), rate("3", false)];
    const s = computeLocalStats("z", assignments, answers, ratings, NOW, DEFAULT_CONFIG);
    expect(s.medianResponseMinutes).toBe(20);
    expect(s.responseRate).toBe(0.75); // 3 cevap / 4 sonuçlanmış (pending sayılmaz, 30 gün dışı sayılmaz)
    expect(s.localScore).toBe(67);
    expect(s.ratedCount).toBe(3);
  });

  it("veri yoksa null", () => {
    const s = computeLocalStats("z", [], [], [], NOW, DEFAULT_CONFIG);
    expect(s).toMatchObject({ medianResponseMinutes: null, responseRate: null, localScore: null });
  });

  it("boş bırakılan 'faydalı' Local Score'a girmez", () => {
    const s = computeLocalStats("z", [as("1", 10, "answered")], [ans("1")], [rate("1", null)], NOW, DEFAULT_CONFIG);
    expect(s.localScore).toBeNull();
  });

  it("formatEta / formatRate", () => {
    expect(formatEta(20)).toBe("~20 dk");
    expect(formatEta(130)).toBe("~2 sa");
    expect(formatEta(null)).toBeNull();
    expect(formatRate(0.954)).toBe("%95");
  });
});
