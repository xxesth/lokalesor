"use client";
import { cityName, locativeSuffix } from "@lokale/domain";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState, ErrorNote, Loading, SectionTitle } from "@/components/ui/misc";
import { Page } from "@/components/layout/two-column";
import { CapacityMeter, useInbox } from "@/features/inbox";
import { useMe } from "@/features/session";
import { AppHeader } from "@/features/shell";
import { Countdown } from "@/components/ui/countdown";

/** Lokal modunun ana sayfası: kapasite, bekleyen sorular ve bugünkü cevaplar (hepsi getInbox'tan). */
export function LocalHome() {
  const { user, currentCity } = useMe();
  const inbox = useInbox();
  const data = inbox.data;
  const name = cityName(currentCity);
  return (
    <>
      <AppHeader />
      <Page className="flex max-w-[760px] flex-col gap-6">
        <h1 className="text-[34px] font-extrabold leading-[38px] tracking-[-0.04em] lg:text-[56px] lg:leading-[58px]">
          Selam {user.name.split(" ")[0]},
          <br />
          <span className="text-gray lg:text-gray-soft">
            {name}
            {locativeSuffix(name)} lokalsin.
          </span>
        </h1>
        {inbox.isLoading && <Loading />}
        <ErrorNote error={inbox.error} />
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
        {data && data.answeredToday.length > 0 && (
          <p className="text-[15px] text-ink-2">Bugün {data.answeredToday.length} soruyu cevapladın.</p>
        )}
      </Page>
    </>
  );
}
