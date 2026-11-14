import type { PersonColor, Question } from "@lokale/contracts";
import { BUDGET_LABELS, TOPIC_LABELS, districtName } from "@lokale/domain";
import type { ReactNode } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Tag } from "@/components/ui/chip";
import { cn } from "@/lib/cn";

/** Sis zeminli soru kartı + etiketler. */
export function QuestionTags({ q }: { q: Question }) {
  const d = districtName(q.district);
  return (
    <div className="flex flex-wrap gap-1">
      <Tag onMist>{TOPIC_LABELS[q.topic]}</Tag>
      <Tag onMist>{BUDGET_LABELS[q.budget]}</Tag>
      {d && <Tag onMist>{d}</Tag>}
    </div>
  );
}

export function QuestionCard({
  q,
  asker,
  meta,
  right,
  large,
}: {
  q: Question;
  asker: { name: string; color: PersonColor };
  meta: string;
  right?: ReactNode;
  large?: boolean;
}) {
  return (
    <section className={cn("flex flex-col gap-3 rounded-panel bg-mist p-4", large && "lg:rounded-panel-l lg:p-6")}>
      <div className="flex items-center gap-2 text-[13px] text-gray">
        <Avatar name={asker.name} color={asker.color} size={22} />
        <span className="font-semibold text-ink">{asker.name}</span>
        <span>· {meta}</span>
        {right && <span className="ml-auto">{right}</span>}
      </div>
      <p className={cn("text-lg font-semibold leading-[25px]", large && "lg:text-[30px] lg:font-bold lg:leading-9 lg:tracking-[-0.02em]")}>{q.text}</p>
      <QuestionTags q={q} />
    </section>
  );
}
