"use client";
import { useQuery } from "@tanstack/react-query";
import { EmptyState, ErrorNote, Loading } from "@/components/ui/misc";
import { Page } from "@/components/layout/two-column";
import { getRepository } from "@/data";
import { qk } from "@/data/query-keys";
import { ArchiveItem } from "@/features/archive";
import { AppHeader } from "@/features/shell";

/** Lokal modunda "Sorularım" sekmesi: verdiğin cevaplar. */
export function MyAnswers() {
  const list = useQuery({ queryKey: qk.myArchive(), queryFn: () => getRepository().listMyArchive() });
  return (
    <>
      <AppHeader />
      <Page className="flex max-w-[760px] flex-col gap-6">
        <h1 className="text-[28px] font-extrabold leading-8 tracking-[-0.03em] lg:text-[44px] lg:leading-[48px]">Cevaplarım</h1>
        {list.isLoading && <Loading />}
        <ErrorNote error={list.error} onRetry={() => void list.refetch()} />
        {list.data?.length === 0 && <EmptyState title="Henüz cevap vermedin">Gelen kutundaki soruları cevapladıkça burada birikir.</EmptyState>}
        <div className="divide-y divide-line">
          {list.data?.map((a) => (
            <ArchiveItem key={a.answer.id} item={a} showLocal={false} />
          ))}
        </div>
      </Page>
    </>
  );
}
