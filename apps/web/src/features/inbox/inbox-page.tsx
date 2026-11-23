"use client";
import { EmptyState, ErrorNote, Loading } from "@/components/ui/misc";
import { Countdown } from "@/components/ui/countdown";
import { InboxIcon } from "@/components/ui/icons";
import { FlowHeader } from "@/components/layout/flow-header";
import { Page } from "@/components/layout/two-column";
import { useState } from "react";
import { TOPIC_LABELS, districtName } from "@lokale/domain";
import { AnswerForm } from "@/features/answer";
import { PoolSection } from "@/features/pool";
import { useMe } from "@/features/session";
import { AppHeader } from "@/features/shell";
import { CapacityMeter } from "./capacity-meter";
import { useInbox } from "./hooks";
import { InboxItem } from "./inbox-item";

/** Telefon: liste → Cevapla ekranı. Masaüstü: e-posta istemcisi düzeni (solda liste, sağda cevap). */
export function InboxPage() {
  const { user } = useMe();
  const inbox = useInbox();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const data = inbox.data;
  const selected = data?.pending.find((p) => p.assignment.id === selectedId) ?? data?.pending[0] ?? null;
  const left = data ? Math.max(0, data.capacity.limit - data.capacity.used) : 0;

  const answered = data && data.answeredToday.length > 0 && (
    <section className="flex flex-col gap-3">
      <h2 className="border-b border-line pb-2.5 text-[15px] font-bold text-gray">Bugün cevapladıkların</h2>
      {data.answeredToday.map((a) => (
        <div key={a.answer.id} className="flex flex-col gap-1 border-b border-line pb-3">
          <span className="text-[13px] font-semibold text-gray">
            {TOPIC_LABELS[a.question.topic]}
            {a.question.district ? ` · ${districtName(a.question.district)}` : ""}
          </span>
          <span className="text-base">{a.question.text}</span>
          <span className="inline-flex items-center gap-2 text-sm text-gray">
            <span className="h-2.5 w-2.5 rounded-full bg-ink" /> Cevaplandı · {a.touristName} · {a.responseMinutes} dk&apos;da
          </span>
        </div>
      ))}
    </section>
  );

  // Telefonda Cevapla ekranı
  if (mobileOpen && selected) {
    return (
      <div className="lg:hidden">
        <FlowHeader backHref="/lokal/gelen-kutusu" title="Cevapla" right={<Countdown deadline={selected.assignment.deadline} assignedAt={selected.assignment.assignedAt} size="s" />} />
        <div className="px-4 pb-28 pt-5">
          <AnswerForm key={selected.assignment.id} item={selected} assignmentId={selected.assignment.id} onDone={() => setMobileOpen(false)} />
        </div>
      </div>
    );
  }

  return (
    <>
      <AppHeader />
      <Page className="flex flex-col gap-6">
        {data && <CapacityMeter capacity={data.capacity} color={user.color} />}
        <div className="flex items-baseline justify-between">
          <h1 className="text-[34px] font-extrabold leading-[38px] tracking-[-0.04em] lg:text-[44px] lg:leading-[48px]">Gelen kutusu</h1>
          {data && <span className="text-[15px] text-gray">{data.pending.length} soru bekliyor</span>}
        </div>
        {inbox.isLoading && <Loading />}
        <ErrorNote error={inbox.error} onRetry={() => void inbox.refetch()} />
        {data && data.pending.length === 0 && (
          <EmptyState icon={<InboxIcon size={56} className="text-line-strong" />} title="Şu an sana atanmış soru yok">
            {left > 0 ? `Bugün ${left} soru daha alabilirsin. Yeni soru gelince zil çalacak.` : "Bugünlük kapasiten doldu. Yarın görüşürüz!"}
          </EmptyState>
        )}
        {data && data.pending.length > 0 && (
          <div className="flex flex-wrap gap-8 lg:flex-nowrap">
            <div className="flex w-full flex-col gap-3 lg:w-[400px] lg:shrink-0">
              {data.pending.map((p) => (
                <InboxItem
                  key={p.assignment.id}
                  item={p}
                  selected={selected?.assignment.id === p.assignment.id}
                  onOpen={() => {
                    setSelectedId(p.assignment.id);
                    if (window.matchMedia("(max-width: 1023px)").matches) setMobileOpen(true);
                  }}
                />
              ))}
            </div>
            {selected && (
              <div className="hidden min-w-0 flex-1 flex-col gap-4 rounded-panel-l border border-line p-6 lg:flex">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold">Cevapla</h2>
                  <Countdown deadline={selected.assignment.deadline} assignedAt={selected.assignment.assignedAt} size="m" />
                </div>
                <AnswerForm key={selected.assignment.id} item={selected} assignmentId={selected.assignment.id} onDone={() => setSelectedId(null)} />
              </div>
            )}
          </div>
        )}
        <PoolSection />
        {answered}
      </Page>
    </>
  );
}
