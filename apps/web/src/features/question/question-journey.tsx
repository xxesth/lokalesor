"use client";
import type { AssignmentWithLocal, Question } from "@lokale/contracts";
import { Avatar } from "@/components/ui/avatar";
import { StatusGlyph, type StatusKind } from "@/components/ui/status";
import { useNow } from "@/data/use-now";
import { cn } from "@/lib/cn";
import { formatClock, minutesBetween } from "@/lib/format";
import { personStyle } from "@/lib/person-color";

interface Seg {
  a: AssignmentWithLocal;
  minutes: number;
  live: boolean;
}

function segments(assignments: AssignmentWithLocal[], now: number): Seg[] {
  return assignments.map((a) => ({
    a,
    live: a.status === "pending",
    minutes: minutesBetween(a.assignedAt, a.resolvedAt ?? Math.min(now, a.deadline)),
  }));
}

function describe(q: Question, segs: Seg[]): string {
  const parts = segs.map((s, i) => {
    const who = `${s.a.local.name}`;
    if (s.a.status === "answered") return `${who} ${s.minutes} dakikada cevapladı`;
    if (s.live) return `soru şu an ${who}'de`;
    return `soru ${s.minutes} dakika ${who}'de kaldı${i < segs.length - 1 ? ", sonra yeniden atandı" : ""}`;
  });
  if (q.status === "open_pool") parts.push("soru açık havuza düştü");
  return parts.length ? `Soru yolculuğu: ${parts.join(", ")}` : "Soru iletildi";
}

/** Telefon: yatay durum çubuğu. Segment uzunluğu sorunun her lokalde beklediği süreyle orantılı. */
export function QuestionJourneyBar({ q, assignments }: { q: Question; assignments: AssignmentWithLocal[] }) {
  const now = useNow() || q.createdAt;
  const segs = segments(assignments, now);
  const answered = q.status === "answered";
  const steps: { label: string; kind: StatusKind; done: boolean }[] = [
    { label: "İletildi", kind: "answered", done: true },
    { label: "Lokalde", kind: segs.length ? "answered" : "delivered", done: segs.length > 0 },
    { label: q.status === "open_pool" ? "Açık havuz" : "Cevaplandı", kind: answered ? "answered" : q.status === "open_pool" ? "open_pool" : "delivered", done: answered },
  ];
  return (
    <section aria-label="Durum" className="flex flex-col gap-2">
      <div className="flex justify-between text-[13px] font-bold">
        {steps.map((s) => (
          <span key={s.label} className={cn("inline-flex items-center gap-1.5", !s.done && "text-gray")}>
            <StatusGlyph kind={s.done ? "answered" : s.kind} size={10} />
            {s.label}
          </span>
        ))}
      </div>
      <div role="img" aria-label={describe(q, segs)} className="flex items-center gap-[3px]">
        <span className="h-2 w-2 shrink-0 rounded-full bg-ink" />
        {segs.map((s, i) => (
          <span key={s.a.id} className="contents">
            {i > 0 && <span className="h-3 w-3 shrink-0 rounded-full border-[2.5px] border-nar bg-paper" />}
            <span
              style={{ ...personStyle(s.a.local.color), flex: Math.max(1, s.minutes) }}
              className={cn("h-1 rounded-sm bg-person", s.live && "animate-pulse")}
            />
          </span>
        ))}
        {segs.length === 0 && <span className="h-1 flex-1 rounded-sm bg-line" />}
        <span className={cn("h-2 w-2 shrink-0 rounded-full", answered ? "bg-ink" : "border-[1.5px] border-ink bg-paper")} />
      </div>
      <div className="flex gap-[3px] text-xs text-ink-2">
        {segs.map((s, i) => (
          <span key={s.a.id} style={{ flex: Math.max(1, s.minutes) }} className="flex min-w-0 flex-col pl-2.5">
            {i > 0 && <span className="font-bold text-nar">Yeniden atandı</span>}
            <span className="truncate">
              {s.a.local.name} · {s.live ? "şu an" : `${s.minutes} dk`}
            </span>
          </span>
        ))}
      </div>
    </section>
  );
}

/** Masaüstü yan sütun: dikey "Sorunun yolculuğu". */
export function QuestionJourneyList({ q, assignments }: { q: Question; assignments: AssignmentWithLocal[] }) {
  const now = useNow() || q.createdAt;
  const segs = segments(assignments, now);
  const last = segs[segs.length - 1];
  const total = last ? minutesBetween(q.createdAt, last.a.resolvedAt ?? now) : 0;
  return (
    <section className="flex flex-col gap-4 rounded-panel-l border border-line p-5" aria-label={describe(q, segs)}>
      <h2 className="text-base font-bold">Sorunun yolculuğu</h2>
      <ol className="flex flex-col">
        <li className="flex items-center gap-3 text-[15px]">
          <span className="h-2.5 w-2.5 rounded-full bg-ink" />
          <span>
            <b>İletildi</b> <span className="text-gray">· {formatClock(q.createdAt)}</span>
          </span>
        </li>
        {segs.map((s, i) => (
          <li key={s.a.id} className="flex flex-col" style={personStyle(s.a.local.color)}>
            {i > 0 && (
              <span className="flex items-center gap-3 text-[15px]">
                <span className="h-3 w-3 rounded-full border-[2.5px] border-nar bg-paper" />
                <span>
                  <b className="text-nar">Yeniden atandı</b> <span className="text-gray">· {formatClock(s.a.assignedAt)}</span>
                </span>
              </span>
            )}
            <span className="ml-[4px] flex items-stretch gap-4">
              <span className="w-[3px] rounded-full bg-person" style={{ minHeight: 24 + Math.min(40, s.minutes) }} />
              <span className="flex items-center gap-2 py-2 text-sm">
                <Avatar name={s.a.local.name} color={s.a.local.color} size={22} />
                Lokalde · {s.a.local.name} · {s.live ? "şu an" : `${s.minutes} dk`}
              </span>
            </span>
          </li>
        ))}
        {q.status === "answered" && last && (
          <li className="flex items-center gap-3 text-[15px]">
            <span className="h-2.5 w-2.5 rounded-full bg-ink" />
            <span>
              <b>Cevaplandı</b> <span className="text-gray">· {formatClock(last.a.resolvedAt ?? now)}</span>
            </span>
          </li>
        )}
        {q.status === "open_pool" && (
          <li className="flex items-center gap-3 text-[15px] text-gray">
            <StatusGlyph kind="open_pool" />
            <b>Açık havuz</b>
          </li>
        )}
      </ol>
      {segs.length > 0 && (
        <p className="border-t border-line pt-3 text-[13px] leading-[19px] text-gray">
          {q.status === "answered" ? `Toplam ${total} dk. ` : ""}Çizginin uzunluğu sorunun her lokalde ne kadar beklediğini gösterir.
        </p>
      )}
    </section>
  );
}
