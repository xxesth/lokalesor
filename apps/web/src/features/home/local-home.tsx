"use client";
import Link from "next/link";
import { cityName, locativeSuffix } from "@lokale/domain";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState, ErrorNote, Loading, SectionTitle } from "@/components/ui/misc";
import { Page } from "@/components/layout/two-column";
import { CapacityMeter, useInbox } from "@/features/inbox";
import { useOpenPool } from "@/features/pool";
import { useMe } from "@/features/session";
import { AppHeader } from "@/features/shell";
import { Countdown } from "@/components/ui/countdown";

/** Lokal modunun ana sayfası: kapasite, bekleyen sorular ve bugünkü cevaplar (hepsi getInbox'tan). */
export function LocalHome() {
  const { user, currentCity } = useMe();
  const inbox = useInbox();
  const data = inbox.data;
  const poolCount = useOpenPool().data?.length ?? 0;
  const name = cityName(currentCity);
  return (
    <>
      <AppHeader />
      <Page className="flex max-w-[760px] flex-col gap-6">
        <h1 className="text-[28px] font-extrabold leading-8 tracking-[-0.03em] lg:text-[44px] lg:leading-[48px] lg:tracking-[-0.04em]">
          Selam {user.name.split(" ")[0]},
          <br className="lg:hidden" />{" "}
          <span className="text-gray lg:text-gray-soft">
            {name}
            {locativeSuffix(name)} lokalsin.
          </span>
        </h1>
        {inbox.isLoading && <Loading />}
        <ErrorNote error={inbox.error} onRetry={() => void inbox.refetch()} />
        {data && <CapacityMeter capacity={data.capacity} color={user.color} />}
        {data && (
          <section className="flex flex-col gap-4">
            <SectionTitle>Bekleyen sorular</SectionTitle>
            {data.pending.length === 0 ? (
              <EmptyState title="Şu an sana atanmış soru yok">Yeni soru gelince zil çalacak.</EmptyState>
            ) : (
              <>
                {data.pending.map((p) => (
                  <div key={p.assignment.id} className="flex items-center justify-between gap-3 border-b border-line pb-3">
                    <span className="min-w-0 truncate text-base">{p.question.text}</span>
                    <Countdown deadline={p.assignment.deadline} assignedAt={p.assignment.assignedAt} size="s" />
                  </div>
                ))}
                <ButtonLink href="/lokal/gelen-kutusu" className="self-start">
                  Gelen kutusuna git
                </ButtonLink>
              </>
            )}
          </section>
        )}
        {poolCount > 0 && (
          <p className="text-[15px] text-ink-2">
            Açık havuzda {poolCount} soru bekliyor.{" "}
            <Link href="/lokal/gelen-kutusu" className="font-bold underline underline-offset-4">
              Göz at
            </Link>
          </p>
        )}
        {data && data.answeredToday.length > 0 && (
          <p className="text-[15px] text-ink-2">Bugün {data.answeredToday.length} soruyu cevapladın.</p>
        )}
      </Page>
    </>
  );
}
