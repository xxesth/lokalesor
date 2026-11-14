import { describe, expect, it } from "vitest";
import { DEFAULT_CONFIG, DEMO_CONFIG } from "./config";
import { deadlineFor, isExpired, planNextStep } from "./reassignment";
import { NOW, cand, user } from "./fixtures.test-utils";

describe("reassignment", () => {
  it("sadece bekleyen ve süresi geçmiş atama dolmuştur", () => {
    expect(isExpired({ status: "pending", deadline: NOW }, NOW)).toBe(true);
    expect(isExpired({ status: "pending", deadline: NOW + 1 }, NOW)).toBe(false);
    expect(isExpired({ status: "answered", deadline: NOW - 1 }, NOW)).toBe(false);
  });

  it("sıradaki lokal varsa yeniden atar", () => {
    expect(planNextStep({ attemptCount: 1 }, cand(user({ id: "zeynep" }), 25), DEFAULT_CONFIG)).toEqual({
      action: "reassign",
      localId: "zeynep",
    });
  });

  it("deneme sınırı aşılınca ya da lokal yoksa açık havuz", () => {
    expect(planNextStep({ attemptCount: 3 }, cand(user({ id: "x" }), 1), DEFAULT_CONFIG)).toEqual({ action: "open_pool" });
    expect(planNextStep({ attemptCount: 1 }, null, DEFAULT_CONFIG)).toEqual({ action: "open_pool" });
  });

  it("deadline = atanma + T", () => {
    expect(deadlineFor(NOW, DEFAULT_CONFIG) - NOW).toBe(30 * 60_000);
    expect(deadlineFor(NOW, DEMO_CONFIG) - NOW).toBe(3 * 60_000);
  });
});
