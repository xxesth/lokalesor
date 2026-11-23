"use client";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState, ErrorNote, Loading } from "@/components/ui/misc";
import { Page } from "@/components/layout/two-column";
import { useSession } from "@/features/session";
import { AppHeader } from "@/features/shell";
import { MyAnswers } from "./my-answers";
import { useMyQuestions } from "./hooks";
import { ActiveQuestionCard } from "./active-question-card";

function TouristQuestions() {
  const mine = useMyQuestions();
  const open = mine.data?.filter((s) => s.question.status === "assigned" || s.question.status === "pending") ?? [];
  const done = mine.data?.filter((s) => s.question.status === "answered" || s.question.status === "open_pool") ?? [];
  return (
    <>
      <AppHeader />
      <Page className="flex max-w-[760px] flex-col gap-6">
        <h1 className="text-[28px] font-extrabold leading-8 tracking-[-0.03em] lg:text-[44px] lg:leading-[48px]">Sorularım</h1>
        {mine.isLoading && <Loading />}
        <ErrorNote error={mine.error} onRetry={() => void mine.refetch()} />
        {mine.data?.length === 0 && (
          <EmptyState title="Henüz soru sormadın">
            <p className="mb-4">Gittiğin şehrin yerlisine sor, dakikalar içinde cevap gelsin.</p>
            <ButtonLink href="/sor">Lokale Sor</ButtonLink>
          </EmptyState>
        )}
        {open.length > 0 && (
          <section className="flex flex-col gap-3">
            <h2 className="text-[15px] font-bold text-gray">Bekleyenler</h2>
            {open.map((s) => <ActiveQuestionCard key={s.question.id} s={s} />)}
          </section>
        )}
        {done.length > 0 && (
          <section className="flex flex-col gap-3">
            <h2 className="text-[15px] font-bold text-gray">Geçmiş</h2>
            {done.map((s) => <ActiveQuestionCard key={s.question.id} s={s} />)}
          </section>
        )}
      </Page>
    </>
  );
}

/** Turistte sorduklarım, lokalde verdiğim cevaplar. */
export function MyQuestions() {
  const { role } = useSession();
  return role === "local" ? <MyAnswers /> : <TouristQuestions />;
}
