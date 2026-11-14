import type { Timestamp } from "@lokale/contracts";
import { DEFAULT_CONFIG } from "./config";

/** Kalan süre (ms), en az 0. */
export function remaining(deadline: Timestamp, now: Timestamp): number {
  return Math.max(0, deadline - now);
}

/**
 * Son dakika → nar (README ilke 3). Atama süresi biliniyorsa eşik sürenin en fazla %25'i olur;
 * böylece T kısa olduğunda (ör. 1 dk) sayaç baştan kırmızı görünmez.
 */
export function isUrgent(
  deadline: Timestamp,
  now: Timestamp,
  assignedAt?: Timestamp,
  thresholdMs = DEFAULT_CONFIG.urgentThresholdMs,
): boolean {
  const r = remaining(deadline, now);
  const limit = assignedAt === undefined ? thresholdMs : Math.min(thresholdMs, (deadline - assignedAt) * 0.25);
  return r > 0 && r <= limit;
}

/** dk:sn biçimi, ör. 754000 → "12:34". */
export function formatCountdown(ms: number): string {
  const total = Math.ceil(Math.max(0, ms) / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/** Kalan sürenin T'ye oranı (0-1), ilerleme çubuğu için. */
export function remainingRatio(assignedAt: Timestamp, deadline: Timestamp, now: Timestamp): number {
  const total = deadline - assignedAt;
  if (total <= 0) return 0;
  return Math.min(1, remaining(deadline, now) / total);
}
