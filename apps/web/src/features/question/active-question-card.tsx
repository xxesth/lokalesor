"use client";
import type { QuestionSummary } from "@lokale/contracts";
import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { Countdown, ProgressLine } from "@/components/ui/countdown";
import { StatusLabel, statusOf } from "@/components/ui/status";

/** Ana sayfa ve Sorularım: soru + durum + soruyu tutan lokal + geri sayım. */
export function ActiveQuestionCard({ s }: { s: QuestionSummary }) {
  const a = s.currentAssignment;
  const kind = statusOf(s.question.status);
  return (
    <Link href={`/soru/${s.question.id}`} className="flex flex-col gap-3 rounded-card border border-line bg-paper p-4 hover:border-ink hover:text-ink">
      <p className="text-[17px] font-semibold leading-6">{s.question.text}</p>
      <div className="flex items-center gap-2">
        <StatusLabel kind={kind} suffix={a ? " ·" : undefined} />
        {a && (
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold">
            <Avatar name={a.local.name} color={a.local.color} size={22} />
            {a.local.name}
          </span>
        )}
        {a && <Countdown deadline={a.deadline} assignedAt={a.assignedAt} size="s" className="ml-auto" />}
      </div>
      {a && <ProgressLine assignedAt={a.assignedAt} deadline={a.deadline} color={a.local.color} />}
    </Link>
  );
}
