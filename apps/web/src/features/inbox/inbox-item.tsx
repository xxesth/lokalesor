"use client";
import type { InboxItem as Item } from "@lokale/contracts";
import { TOPIC_LABELS, districtName, isUrgent } from "@lokale/domain";
import { ArrowRightIcon } from "@/components/ui/icons";
import { Countdown } from "@/components/ui/countdown";
import { useNow } from "@/data/use-now";
import { cn } from "@/lib/cn";

/** Süresi azalan öğe nar kenarlıklı. */
export function InboxItem({ item, selected, onOpen }: { item: Item; selected?: boolean; onOpen: () => void }) {
  const now = useNow();
  const urgent = now ? isUrgent(item.assignment.deadline, now, item.assignment.assignedAt) : false;
  const where = districtName(item.question.district);
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-current={selected ? "true" : undefined}
      className={cn(
        "flex w-full flex-col gap-2.5 rounded-card border p-4 text-left transition-colors lg:rounded-none lg:border-x-0 lg:border-t-0",
        urgent ? "border-nar lg:border-line lg:shadow-[inset_0_0_0_2px_var(--nar)]" : "border-line hover:border-ink lg:hover:border-line",
        selected && "bg-mist",
      )}
    >
      <span className="flex w-full items-center justify-between gap-2">
        <span className="text-[15px] font-semibold text-ink-2">
          {TOPIC_LABELS[item.question.topic]}
          {where ? ` · ${where}` : ""}
        </span>
        <Countdown deadline={item.assignment.deadline} assignedAt={item.assignment.assignedAt} size="m" />
      </span>
      <span className="text-[17px] font-semibold leading-6">{item.question.text}</span>
      <span className="flex w-full items-center justify-between text-[15px]">
        <span className="text-gray">{item.touristName} soruyor</span>
        <span className="inline-flex items-center gap-1.5 font-bold lg:hidden">
          Cevapla <ArrowRightIcon />
        </span>
      </span>
    </button>
  );
}
