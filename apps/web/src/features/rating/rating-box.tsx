"use client";
import type { Answer, Rating } from "@lokale/contracts";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ThumbDownIcon, ThumbUpIcon } from "@/components/ui/icons";
import { ErrorNote } from "@/components/ui/misc";
import { getRepository } from "@/data";
import { qk } from "@/data/query-keys";
import { cn } from "@/lib/cn";

type Key = "useful" | "upToDate" | "trustworthy";
const CRITERIA: { key: Key; label: string }[] = [
  { key: "useful", label: "Faydalı mı?" },
  { key: "upToDate", label: "Güncel mi?" },
  { key: "trustworthy", label: "Güvenilir mi?" },
];

function Thumb({ up, pressed, label, onClick }: { up: boolean; pressed: boolean; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label={`${label} ${up ? "evet" : "hayır"}`}
      aria-pressed={pressed}
      onClick={onClick}
      className={cn(
        "inline-flex h-11 w-11 items-center justify-center rounded-control border",
        pressed ? "border-ink bg-ink text-paper" : "border-line-strong bg-paper text-ink hover:border-ink",
      )}
    >
      {up ? <ThumbUpIcon /> : <ThumbDownIcon />}
    </button>
  );
}

/** 3 ölçüt × evet/hayır, her biri boş bırakılabilir (README Davranış). */
export function RatingBox({
  answer,
  localName,
  existing,
  onReport,
}: {
  answer: Answer;
  localName: string;
  existing: Rating | null;
  onReport: () => void;
}) {
  const qc = useQueryClient();
  const [v, setV] = useState<Record<Key, boolean | null>>({ useful: null, upToDate: null, trustworthy: null });
  const [score, setScore] = useState<number | null>(null);
  const rate = useMutation({
    mutationFn: () => getRepository().rateAnswer({ answerId: answer.id, ...v }),
    onSuccess: (r) => {
      setScore(r.localScore);
      void qc.invalidateQueries({ queryKey: qk.thread(answer.questionId) });
      void qc.invalidateQueries({ queryKey: qk.profile(answer.localId) });
    },
  });

  if (existing || rate.isSuccess) {
    return (
      <section aria-live="polite" className="flex flex-col gap-1 rounded-panel bg-mist p-4">
        <span className="text-base font-bold">Teşekkürler!</span>
        <span className="text-[15px] text-ink-2">
          {score !== null
            ? `${localName} için Local Score şimdi ${score}. Değerlendirmen bir sonraki turiste yol gösterecek.`
            : "Değerlendirmen kaydedildi."}
        </span>
      </section>
    );
  }

  const any = Object.values(v).some((x) => x !== null);
  return (
    <section aria-label="Değerlendirme" className="flex flex-col gap-1 rounded-panel border-[1.5px] border-ink p-4 lg:p-5">
      <span className="pb-1.5 text-base font-bold">Cevabı değerlendir</span>
      <div className="flex flex-col lg:grid lg:grid-cols-3 lg:gap-3">
        {CRITERIA.map((c) => (
          <div key={c.key} className="flex items-center justify-between border-b border-line py-1.5 lg:rounded-card lg:border lg:px-3 lg:py-2">
            <span className="text-[15px]">{c.label}</span>
            <div className="flex gap-1.5">
              <Thumb up label={c.label} pressed={v[c.key] === true} onClick={() => setV({ ...v, [c.key]: v[c.key] === true ? null : true })} />
              <Thumb up={false} label={c.label} pressed={v[c.key] === false} onClick={() => setV({ ...v, [c.key]: v[c.key] === false ? null : false })} />
            </div>
          </div>
        ))}
      </div>
      <ErrorNote error={rate.error} />
      <div className="mt-3 flex items-center justify-between">
        <Button onClick={() => rate.mutate()} disabled={!any || rate.isPending}>
          Gönder
        </Button>
        <button type="button" onClick={onReport} className="h-11 text-[13px] text-gray underline underline-offset-4">
          Şikâyet et
        </button>
      </div>
    </section>
  );
}
