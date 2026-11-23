"use client";
import type { Topic } from "@lokale/contracts";
import { cityName, formatEta, locativeSuffix, median } from "@lokale/domain";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { TopicChips } from "@/components/ui/chip";
import { EmptyState, ErrorNote, Loading, SectionTitle } from "@/components/ui/misc";
import { Page, TwoColumn } from "@/components/layout/two-column";
import { getRepository } from "@/data";
import { qk } from "@/data/query-keys";
import { ArchiveItem } from "@/features/archive";
import { ActiveQuestionCard, useMyQuestions } from "@/features/question";
import { useMe, useSession } from "@/features/session";
import { AppHeader } from "@/features/shell";
import { LocalHome } from "./local-home";

function AskBox() {
  const { currentCity } = useMe();
  const router = useRouter();
  const [text, setText] = useState("");
  const locals = useQuery({ queryKey: qk.availableLocals(currentCity), queryFn: () => getRepository().listAvailableLocals(currentCity) });
  const eta = formatEta(median((locals.data ?? []).map((l) => l.medianResponseMinutes ?? 60)));

  function submit(e: FormEvent) {
    e.preventDefault();
    router.push(text.trim() ? `/sor?metin=${encodeURIComponent(text.trim())}` : "/sor");
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-3 rounded-panel border-[1.5px] border-ink p-5">
      <label htmlFor="ask-box" className="text-lg font-bold">
        Lokale sor
      </label>
      <div className="flex flex-col gap-3 lg:flex-row">
        <input
          id="ask-box"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Ne merak ediyorsun?"
          className="h-12 min-w-0 rounded-control border border-line-strong px-4 text-base lg:flex-1 placeholder:text-gray focus:border-ink"
        />
        <Button type="submit" className="w-full lg:w-auto lg:px-8">
          Lokale Sor
        </Button>
      </div>
      {locals.data && locals.data.length > 0 && (
        <div className="flex items-center gap-3 pt-1">
          <span className="flex -space-x-2">
            {locals.data.slice(0, 3).map((l) => (
              <Avatar key={l.id} name={l.name} color={l.color} size={32} ring />
            ))}
          </span>
          <span className="text-sm text-ink-2">Lokaller genelde {eta ?? "1 saat"} içinde yanıt veriyor.</span>
        </div>
      )}
    </form>
  );
}

function ActiveQuestions() {
  const mine = useMyQuestions();
  const active = mine.data?.filter((s) => s.question.status === "assigned" || s.question.status === "pending") ?? [];
  return (
    <section className="flex flex-col gap-4">
      <SectionTitle>Aktif sorularım</SectionTitle>
      {mine.isLoading && <Loading />}
      <ErrorNote error={mine.error} onRetry={() => void mine.refetch()} />
      {mine.data && active.length === 0 && <p className="text-[15px] text-gray">Bekleyen sorun yok. Sorduğunda burada geri sayımı göreceksin.</p>}
      <div className="grid gap-4 lg:grid-cols-2">
        {active.map((s) => (
          <ActiveQuestionCard key={s.question.id} s={s} />
        ))}
      </div>
    </section>
  );
}

function PopularQuestions() {
  const { currentCity } = useMe();
  const [topic, setTopic] = useState<Topic | null>(null);
  const query = topic ? { city: currentCity, topic } : { city: currentCity };
  const popular = useQuery({ queryKey: qk.popular(query), queryFn: () => getRepository().listPopular(query) });
  const name = cityName(currentCity);
  return (
    <section className="flex flex-col gap-4">
      <SectionTitle>
        {name}
        {locativeSuffix(name)} popüler sorular
      </SectionTitle>
      <TopicChips value={topic} onChange={setTopic} withAll scroll />
      {popular.isLoading && <Loading />}
      <ErrorNote error={popular.error} onRetry={() => void popular.refetch()} />
      {popular.data?.items.length === 0 && <EmptyState title="Bu konuda henüz arşiv yok">İlk soran sen ol.</EmptyState>}
      <div className="divide-y divide-line">
        {popular.data?.items.map((a) => (
          <ArchiveItem key={a.answer.id} item={a} />
        ))}
      </div>
    </section>
  );
}

function TouristHome() {
  const { user, currentCity } = useMe();
  const name = cityName(currentCity);
  return (
    <>
      <AppHeader />
      <Page>
        <h1 className="mb-6 text-[28px] font-extrabold leading-8 tracking-[-0.03em] lg:mb-10 lg:text-[44px] lg:leading-[48px] lg:tracking-[-0.04em]">
          Selam {user.name.split(" ")[0]},
          <br className="lg:hidden" />{" "}
          <span className="text-gray lg:text-gray-soft">
            {name}
            {locativeSuffix(name)}
            {locativeSuffix(name).endsWith("e") ? "sin" : "sın"}.
          </span>
        </h1>
        <TwoColumn
          main={
            <>
              <AskBox />
              <ActiveQuestions />
            </>
          }
          side={<PopularQuestions />}
        />
      </Page>
    </>
  );
}

/** Rol, hangi ana sayfanın görüneceğini belirler. */
export function HomePage() {
  const { role } = useSession();
  return role === "local" ? <LocalHome /> : <TouristHome />;
}
