"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { EmptyState, ErrorNote, Loading } from "@/components/ui/misc";
import { FlowHeader } from "@/components/layout/flow-header";
import { Page } from "@/components/layout/two-column";
import { getRepository } from "@/data";
import { qk } from "@/data/query-keys";
import { AppHeader } from "@/features/shell";
import { ArchiveItem } from "./archive-item";

/** Lokalin cevapları: arşive ekle / arşivden kaldır (🟡). */
export function MyArchivePage() {
  const qc = useQueryClient();
  const list = useQuery({ queryKey: qk.myArchive(), queryFn: () => getRepository().listMyArchive() });
  const toggle = useMutation({
    mutationFn: (v: { id: string; archived: boolean }) => getRepository().setArchived(v.id, v.archived),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.myArchive() }),
  });
  return (
    <>
      <AppHeader hideOnMobile />
      <FlowHeader backHref="/lokal/gelen-kutusu" title="Soru arşivim" />
      <Page className="flex max-w-[760px] flex-col gap-4">
        <h1 className="hidden text-[44px] font-extrabold tracking-[-0.04em] lg:block">Soru arşivim</h1>
        {list.isLoading && <Loading />}
        <ErrorNote error={list.error} onRetry={() => void list.refetch()} />
        <ErrorNote error={toggle.error} />
        {list.data?.length === 0 && <EmptyState title="Henüz cevabın yok" />}
        <div className="divide-y divide-line">
          {list.data?.map((a) => (
            <div key={a.answer.id} className="flex flex-col">
              <ArchiveItem item={a} showLocal={false} />
              <button
                type="button"
                onClick={() => toggle.mutate({ id: a.answer.id, archived: !a.answer.archived })}
                className="-mt-1 mb-3 inline-flex min-h-11 items-center self-start text-sm font-bold underline underline-offset-4"
              >
                {a.answer.archived ? "Arşivden kaldır" : "Arşive ekle"}
              </button>
            </div>
          ))}
        </div>
      </Page>
    </>
  );
}
