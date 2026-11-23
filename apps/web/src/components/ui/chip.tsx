"use client";
import type { Budget, Topic } from "@lokale/contracts";
import { BUDGETS, TOPICS } from "@lokale/contracts";
import { BUDGET_LABELS, TOPIC_LABELS } from "@lokale/domain";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function Chip({
  pressed,
  onClick,
  children,
  className,
}: {
  pressed: boolean;
  onClick: () => void;
  children: ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className={cn(
        "h-11 shrink-0 rounded-control border px-3 text-sm font-medium transition-colors",
        pressed ? "border-ink bg-ink text-paper" : "border-line-strong bg-paper text-ink hover:border-ink",
        className,
      )}
    >
      {children}
    </button>
  );
}

/** Salt okunur etiket (soru kartlarında). */
export function Tag({ children, onMist }: { children: ReactNode; onMist?: boolean }) {
  return (
    <span className={cn("rounded-chip px-2 py-[3px] text-xs font-medium", onMist ? "bg-paper" : "bg-mist")}>{children}</span>
  );
}

/** Konu çipleri: filtre (all seçeneği) veya soru formu (tek seçim). */
export function TopicChips({
  value,
  onChange,
  withAll,
  scroll,
}: {
  value: Topic | null;
  onChange: (t: Topic | null) => void;
  withAll?: boolean;
  scroll?: boolean;
}) {
  return (
    <div role="group" aria-label="Konu" className={cn("flex gap-1.5", scroll ? "no-scrollbar -mx-4 overflow-x-auto px-4 lg:mx-0 lg:flex-wrap lg:overflow-visible lg:px-0" : "flex-wrap")}>
      {withAll && (
        <Chip pressed={value === null} onClick={() => onChange(null)}>
          Tümü
        </Chip>
      )}
      {TOPICS.map((t) => (
        <Chip key={t} pressed={value === t} onClick={() => onChange(withAll && value === t ? null : t)}>
          {TOPIC_LABELS[t]}
        </Chip>
      ))}
    </div>
  );
}

export function BudgetSegment({ value, onChange }: { value: Budget; onChange: (b: Budget) => void }) {
  return (
    <div role="group" aria-label="Bütçe" className="inline-flex overflow-hidden rounded-control border border-ink">
      {BUDGETS.map((b, i) => (
        <button
          key={b}
          type="button"
          aria-pressed={value === b}
          onClick={() => onChange(b)}
          className={cn("h-11 w-14 text-sm font-bold", i > 0 && "border-l border-ink", value === b ? "bg-ink text-paper" : "bg-paper text-ink")}
        >
          {BUDGET_LABELS[b]}
        </button>
      ))}
    </div>
  );
}
