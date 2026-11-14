import { describe, expect, it } from "vitest";
import { formatCountdown, isUrgent, remaining, remainingRatio } from "./countdown";
import { locativeSuffix } from "./labels";
import * as messages from "./messages";
import { resolveRole } from "./role";
import { findSimilar, tokenize } from "./similarity";
import { NOW } from "./fixtures.test-utils";

describe("countdown", () => {
  it("kalan süre ve aciliyet", () => {
    expect(remaining(NOW - 5, NOW)).toBe(0);
    expect(isUrgent(NOW + 42_000, NOW)).toBe(true);
    expect(isUrgent(NOW + 61_000, NOW)).toBe(false);
    expect(isUrgent(NOW, NOW)).toBe(false);
    // T = 1 dk: eşik 15 sn
    expect(isUrgent(NOW + 40_000, NOW, NOW - 20_000)).toBe(false);
    expect(isUrgent(NOW + 10_000, NOW, NOW - 50_000)).toBe(true);
    expect(formatCountdown(42_000)).toBe("0:42");
    expect(formatCountdown(12 * 60_000 + 30_000)).toBe("12:30");
    expect(remainingRatio(NOW - 50, NOW + 50, NOW)).toBe(0.5);
  });
});

describe("role", () => {
  it("kendi şehrinde lokal, başka şehirde turist, elle geçiş öncelikli", () => {
    expect(resolveRole({ homeCity: "istanbul" }, "istanbul", null)).toBe("local");
    expect(resolveRole({ homeCity: "ankara" }, "istanbul", null)).toBe("tourist");
    expect(resolveRole({ homeCity: "istanbul" }, "istanbul", "tourist")).toBe("tourist");
  });
});

describe("messages", () => {
  it("Türkçe ekler", () => {
    expect(messages.dative("Mert")).toBe("Mert'e");
    expect(messages.dative("Zeynep")).toBe("Zeynep'e");
    expect(messages.dative("Can")).toBe("Can'a");
    expect(messages.dative("Melike Kaplan")).toBe("Melike Kaplan'a");
    expect(messages.dative("Deniz")).toBe("Deniz'e");
    expect(messages.dative("Yağmur Arpa")).toBe("Yağmur Arpa'ya");
    expect(locativeSuffix("İstanbul")).toBe("'da");
    expect(locativeSuffix("İzmir")).toBe("'de");
  });

  it("brief 2.3 şablonları", () => {
    expect(messages.assigned("Mert", "~20 dk")).toBe("Sorun Mert'e iletildi. Genelde ~20 dk içinde yanıt veriyor.");
    expect(messages.reassigned("Mert", "Zeynep", "~25 dk")).toBe(
      "Mert şu an müsait değil. Sorunu Zeynep'e yönlendirdik, tahmini süre ~25 dk.",
    );
    expect(messages.assigned("Deniz", null)).toContain("1 saat içinde");
    expect(messages.localNewQuestion("local_food", "kadikoy", 1)).toBe(
      "Yeni bir soru var: Yerel yemek – Kadıköy. Cevaplamak için 1 dk'n var.",
    );
  });
});

describe("similarity", () => {
  const archive = [
    "Kadıköy'de ucuz ve yerel bir akşam yemeği önerisi?",
    "Moda'da öğrenci bütçesiyle nerede yenir?",
    "Beşiktaş'ta maç günü nerelerden uzak durmalıyım?",
  ];
  it("benzer soruları bulur, alakasızı bulmaz", () => {
    const res = findSimilar("Kadıköy'de öğrenci bütçesine uygun, turistik olmayan bir akşam yemeği yeri?", archive, (x) => x, 2);
    expect(res).toEqual([archive[0], archive[1]]);
  });
  it("kısa metinde öneri yok", () => {
    expect(findSimilar("yemek", archive, (x) => x, 2)).toEqual([]);
    expect(tokenize("İstanbul'da").has("istan")).toBe(true);
  });
});
