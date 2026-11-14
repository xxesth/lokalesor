"use client";
import type { PersonColor } from "@lokale/contracts";
import { formatCountdown, isUrgent, remaining, remainingRatio } from "@lokale/domain";
import { useNow } from "@/data/use-now";
import { cn } from "@/lib/cn";
import { personStyle } from "@/lib/person-color";

/** Rozet değil, büyük rakam (README ilke 4). Son dakikada nar + nokta. */
export function Countdown({
  deadline,
  assignedAt,
  size = "m",
  className,
}: {
  deadline: number;
  assignedAt?: number;
  size?: "s" | "m" | "l";
  className?: string;
}) {
  const now = useNow();
  if (!now) return null;
  const urgent = isUrgent(deadline, now, assignedAt);
  const left = remaining(deadline, now);
  const num = size === "l" ? "text-[40px] leading-10" : size === "m" ? "text-[28px] leading-8" : "text-xl leading-6";
  return (
    <span className={cn("inline-flex items-baseline gap-2", className)} role="timer" aria-live="off">
      {urgent && <span aria-hidden className="h-2 w-2 self-center rounded-full bg-nar" />}
      <span className={cn("tabular font-bold tracking-[-0.03em]", num, urgent && "text-nar")}>{formatCountdown(left)}</span>
      <span className="text-sm text-gray">{left > 0 ? "kaldı" : "süre doldu"}</span>
    </span>
  );
}

/** Kalan sürenin oranı; soruyu tutan lokalin renginde, son dakikada nar. */
export function ProgressLine({
  assignedAt,
  deadline,
  color,
}: {
  assignedAt: number;
  deadline: number;
  color: PersonColor;
}) {
  const now = useNow();
  const ratio = now ? remainingRatio(assignedAt, deadline, now) : 1;
  const urgent = now ? isUrgent(deadline, now, assignedAt) : false;
  return (
    <span className="block h-[3px] w-full rounded-full bg-line" style={personStyle(color)}>
      <span
        className={cn("block h-[3px] rounded-full transition-[width] duration-1000 ease-linear", urgent ? "bg-nar" : "bg-person")}
        style={{ width: `${Math.max(2, ratio * 100)}%` }}
      />
    </span>
  );
}
