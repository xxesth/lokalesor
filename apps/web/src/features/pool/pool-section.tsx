"use client";
import { cityName, messages } from "@lokale/domain";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ErrorNote, Loading } from "@/components/ui/misc";
import { StatusGlyph } from "@/components/ui/status";
import { useNow } from "@/data/use-now";
import { timeAgo } from "@/lib/format";
import { AnswerForm } from "@/features/answer";
import { QuestionCard } from "@/features/question";
import { useMe } from "@/features/session";
import { useOpenPool } from "./hooks";

/** Gelen kutusunun altında: kimseye atanamayan sorular. Kart açılınca cevap formu yerinde belirir. */
export function PoolSection() {
  const { user } = useMe();
  const pool = useOpenPool();
  const now = useNow();
  const [openId, setOpenId] = useState<string | null>(null);
  const items = pool.data ?? [];
  return (
    <section className="flex flex-col gap-4" aria-labelledby="pool-title">
      <div className="flex flex-col gap-1 border-b border-line pb-2.5">
        <h2 id="pool-title" className="flex items-center gap-2 text-[15px] font-bold text-gray">
          <StatusGlyph kind="open_pool" />
          Açık havuz · {cityName(user.homeCity)}
          {items.length > 0 && <span className="tabular font-semibold">({items.length})</span>}
        </h2>
        <p className="text-sm text-gray">{messages.poolIntroLocal()}</p>
      </div>
      {pool.isLoading && <Loading />}
      <ErrorNote error={pool.error} />
      {pool.data && items.length === 0 && <p className="text-[15px] text-gray">{messages.poolEmptyLocal()}</p>}
      {items.map((p) => {
        const open = openId === p.question.id;
        return (
          <div key={p.question.id} className="flex flex-col gap-3">
            <QuestionCard
              q={p.question}
              asker={{ name: p.touristName, color: p.touristColor }}
              meta={now ? `havuza düştü · ${timeAgo(p.pooledAt, now)}` : ""}
            />
            {open ? (
              <div className="flex flex-col gap-3 rounded-panel border border-line p-4">
                <AnswerForm item={p} onDone={() => setOpenId(null)} />
                <Button variant="text" onClick={() => setOpenId(null)} className="self-center">
                  Vazgeç
                </Button>
              </div>
            ) : (
              <Button variant="secondary" size="md" className="self-start" onClick={() => setOpenId(p.question.id)} aria-label={`${p.touristName} sorusunu cevapla`}>
                Cevapla
              </Button>
            )}
          </div>
        );
      })}
    </section>
  );
}
