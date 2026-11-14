"use client";
import type { Id } from "@lokale/contracts";
import { useState } from "react";
import { Countdown, ProgressLine } from "@/components/ui/countdown";
import { BackLink, FlowHeader } from "@/components/layout/flow-header";
import { Page, TwoColumn } from "@/components/layout/two-column";
import { Avatar } from "@/components/ui/avatar";
import { ErrorNote, Loading, Sheet } from "@/components/ui/misc";
import { StatusLabel, statusOf } from "@/components/ui/status";
import { formatRelative, minutesBetween } from "@/lib/format";
import { useNow } from "@/data/use-now";
import { LocalProfileCompact, useLocalProfile } from "@/features/profile";
import { RatingBox, ReportForm } from "@/features/rating";
import { useSession } from "@/features/session";
import { AppHeader } from "@/features/shell";
import { AutoMessage } from "./auto-message";
import { useQuestionThread } from "./hooks";
import { HumanAnswerCard } from "./human-answer-card";
import { QuestionCard } from "./question-card";
import { QuestionJourneyBar, QuestionJourneyList } from "./question-journey";

/** En önemli ekran: durum çubuğu, otomatik mesajlar, insan cevabı, değerlendirme. Sayfa yenilenmeden güncellenir. */
export function QuestionDetail({ id }: { id: Id }) {
  const thread = useQuestionThread(id);
  const { session } = useSession();
  const now = useNow();
  const [sheet, setSheet] = useState(false);
  const [report, setReport] = useState<Id | null>(null);

  const t = thread.data;
  const answerItem = t?.items.find((i) => i.type === "answer");
  const featuredLocalId = answerItem?.type === "answer" ? answerItem.local.id : (t?.currentAssignment?.localId ?? t?.assignments.at(-1)?.localId ?? null);
  const profile = useLocalProfile(featuredLocalId);
  const isAsker = t && session?.user.id === t.question.touristId;
  const kind = t ? statusOf(t.question.status) : "delivered";

  return (
    <>
      <AppHeader hideOnMobile />
      <FlowHeader backHref="/sorularim" title="Sorun" right={t && <StatusLabel kind={kind} />} />
      <Page>
        {thread.isLoading && <Loading />}
        <ErrorNote error={thread.error} />
        {t && (
          <TwoColumn
            main={
              <>
                <BackLink href="/sorularim">Sorularım</BackLink>
                <QuestionCard
                  q={t.question}
                  asker={t.asker}
                  meta={now ? formatRelative(t.question.createdAt, now) : ""}
                  right={<span className="hidden lg:block"><StatusLabel kind={kind} /></span>}
                  large
                />
                <div className="lg:hidden">
                  <QuestionJourneyBar q={t.question} assignments={t.assignments} />
                </div>

                {t.currentAssignment && (
                  <section className="flex flex-col gap-2 rounded-panel border border-line p-4" style={{}}>
                    <div className="flex items-center gap-2 text-sm">
                      <Avatar name={t.currentAssignment.local.name} color={t.currentAssignment.local.color} size={24} />
                      <span>
                        Soru şu an <b>{t.currentAssignment.local.name}</b> lokalinde
                      </span>
                    </div>
                    <Countdown deadline={t.currentAssignment.deadline} assignedAt={t.currentAssignment.assignedAt} size="l" />
                    <ProgressLine assignedAt={t.currentAssignment.assignedAt} deadline={t.currentAssignment.deadline} color={t.currentAssignment.local.color} />
                    <p className="text-[13px] text-gray">Süre dolarsa sorun otomatik olarak sıradaki lokale geçer.</p>
                  </section>
                )}

                <div className="flex flex-col gap-3.5 border-t border-line pt-5" aria-live="polite">
                  {t.items.map((i) =>
                    i.type === "system" ? (
                      <AutoMessage key={i.message.id} m={i.message} />
                    ) : (
                      <HumanAnswerCard
                        key={i.answer.id}
                        answer={i.answer}
                        local={i.local}
                        responseMinutes={(() => {
                          const a = t.assignments.find((x) => x.localId === i.local.id && x.status === "answered");
                          return a?.resolvedAt ? minutesBetween(a.assignedAt, a.resolvedAt) : undefined;
                        })()}
                        action={
                          <button type="button" onClick={() => setSheet(true)} className="inline-flex min-h-11 items-center text-[13px] font-bold underline underline-offset-4 lg:hidden">
                            Profil
                          </button>
                        }
                      />
                    ),
                  )}
                </div>

                {isAsker && answerItem?.type === "answer" && (
                  <RatingBox
                    answer={answerItem.answer}
                    localName={answerItem.local.name}
                    existing={t.myRating}
                    onReport={() => setReport(answerItem.answer.id)}
                  />
                )}
              </>
            }
            side={
              <div className="hidden flex-col gap-5 lg:flex">
                {profile.data && <LocalProfileCompact p={profile.data} />}
                <QuestionJourneyList q={t.question} assignments={t.assignments} />
              </div>
            }
          />
        )}
      </Page>
      <Sheet open={sheet} onClose={() => setSheet(false)} title="Lokal profili">
        {profile.data && <LocalProfileCompact p={profile.data} />}
      </Sheet>
      <Sheet open={!!report} onClose={() => setReport(null)} title="Şikâyet et">
        {report && <ReportForm answerId={report} onDone={() => setReport(null)} />}
      </Sheet>
    </>
  );
}
