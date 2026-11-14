"use client";
import type { InboxItem } from "@lokale/contracts";
import { ANSWER_TEMPLATES } from "@lokale/domain";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ErrorNote, FieldLabel, Textarea } from "@/components/ui/misc";
import { getRepository } from "@/data";
import { qk } from "@/data/query-keys";
import { cn } from "@/lib/cn";
import { QuestionTags } from "@/features/question";

/** Lokalin eforu minimum: şablona dokun → boşlukları doldur → gönder (hedef 30 sn). */
export function AnswerForm({ item, onDone }: { item: InboxItem; onDone: () => void }) {
  const qc = useQueryClient();
  const [text, setText] = useState("");
  const [templateId, setTemplateId] = useState<string | null>(null);
  const [archive, setArchive] = useState(true);

  const done = () => {
    void qc.invalidateQueries({ queryKey: qk.inbox() });
    onDone();
  };
  const submit = useMutation({
    mutationFn: () => getRepository().submitAnswer({ assignmentId: item.assignment.id, text, templateId, archive }),
    onSuccess: done,
  });
  const decline = useMutation({ mutationFn: () => getRepository().declineAssignment(item.assignment.id), onSuccess: done });

  function applyTemplate(id: string, t: string) {
    setTemplateId(id);
    setText((cur) => (cur.trim() ? `${cur.trim()} ${t}` : t));
  }

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-3 rounded-panel bg-mist p-4 lg:p-5">
        <span className="flex items-center gap-2 text-sm">
          <Avatar name={item.touristName} color={item.touristColor} size={28} />
          <b>{item.touristName}</b> <span className="text-gray">soruyor</span>
        </span>
        <p className="text-[22px] font-bold leading-7 tracking-[-0.01em]">{item.question.text}</p>
        <QuestionTags q={item.question} />
      </section>

      <section className="flex flex-col gap-2">
        <div>
          <h2 className="text-base font-bold">Hazır şablonlar</h2>
          <p className="text-sm text-gray">Dokun, metin alanına eklensin. Boşlukları doldur.</p>
        </div>
        <div className="flex flex-col gap-2">
          {ANSWER_TEMPLATES.map((t) => (
            <button
              key={t.id}
              type="button"
              aria-pressed={templateId === t.id}
              onClick={() => applyTemplate(t.id, t.text)}
              className={cn(
                "min-h-11 rounded-control border px-4 py-2.5 text-left text-[15px]",
                templateId === t.id ? "border-ink bg-ink font-semibold text-paper" : "border-line-strong hover:border-ink",
              )}
            >
              {t.text}
            </button>
          ))}
        </div>
      </section>

      <div className="flex flex-col gap-2">
        <FieldLabel htmlFor="answer-text">Cevabın</FieldLabel>
        <Textarea id="answer-text" rows={4} value={text} onChange={(e) => setText(e.target.value)} className="border-ink" placeholder="Bir şablona dokun ya da kendin yaz." />
      </div>

      <label className="flex min-h-11 items-center gap-3 text-base">
        <input type="checkbox" checked={archive} onChange={(e) => setArchive(e.target.checked)} className="h-6 w-6 accent-[var(--ink)]" />
        Arşive eklensin <span className="text-sm text-gray">· başkaları da görsün</span>
      </label>

      <ErrorNote error={submit.error ?? decline.error} />
      <div className="flex flex-col items-center gap-2">
        <Button className="w-full" disabled={text.trim().length < 5 || text.includes("…") || submit.isPending} onClick={() => submit.mutate()}>
          Gönder
        </Button>
        {text.includes("…") && <span className="text-[13px] text-gray">Şablondaki “…” boşluklarını doldur.</span>}
        <button
          type="button"
          onClick={() => decline.mutate()}
          disabled={decline.isPending}
          className="min-h-11 text-[15px] font-semibold text-gray hover:text-ink"
        >
          Bilmiyorum, sıradakine geçsin
        </button>
      </div>
    </div>
  );
}
