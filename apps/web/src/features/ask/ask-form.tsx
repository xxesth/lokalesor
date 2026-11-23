"use client";
import type { Budget, DistrictId, QuestionSummary, Topic } from "@lokale/contracts";
import { CITIES, districtName, locativeSuffix, messages } from "@lokale/domain";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Button, ButtonLink } from "@/components/ui/button";
import { BudgetSegment, TopicChips } from "@/components/ui/chip";
import { CitySelector } from "@/components/layout/city-selector";
import { FlowHeader } from "@/components/layout/flow-header";
import { Page } from "@/components/layout/two-column";
import { ErrorNote, FieldLabel, Select, Textarea } from "@/components/ui/misc";
import { SystemSquareIcon } from "@/components/ui/icons";
import { getRepository } from "@/data";
import { qk } from "@/data/query-keys";
import { ArchiveItem } from "@/features/archive";
import { useMe, useSession } from "@/features/session";
import { AppHeader } from "@/features/shell";

function useDebounced<T>(value: T, ms: number): T {
  const [v, setV] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setV(value), ms);
    return () => clearTimeout(id);
  }, [value, ms]);
  return v;
}

/** Göndermeden önce arşivde benzer, lokal onaylı cevaplar (brief #12). */
function SimilarAnswersPanel({ text, onEnough, onDismiss }: { text: string; onEnough: () => void; onDismiss: () => void }) {
  const { currentCity } = useMe();
  const q = useDebounced(text.trim(), 400);
  const similar = useQuery({
    queryKey: qk.similar(currentCity, q),
    queryFn: () => getRepository().findSimilarAnswers({ city: currentCity, text: q }),
    enabled: q.length >= 12,
  });
  if (!similar.data?.length) return null;
  return (
    <section aria-live="polite" className="flex flex-col gap-3 rounded-panel bg-mist p-4">
      <div>
        <h2 className="text-[17px] font-bold">Benzer sorular cevaplanmış</h2>
        <p className="text-sm text-gray">Belki aradığın cevap zaten burada.</p>
      </div>
      {similar.data.map((a) => (
        <ArchiveItem key={a.answer.id} item={a} variant="card" showTopic={false} />
      ))}
      <div className="grid grid-cols-2 gap-2">
        <Button variant="secondary" onClick={onEnough}>
          Bu yeterli
        </Button>
        <Button onClick={onDismiss}>Yine de sor</Button>
      </div>
    </section>
  );
}

/** Gönderimden sonra iki ara durum: aranıyor → iletildi. */
function AskProgress({ result }: { result: QuestionSummary | null }) {
  const router = useRouter();
  const a = result?.currentAssignment ?? null;
  useEffect(() => {
    if (!result) return;
    const id = setTimeout(() => router.push(`/soru/${result.question.id}`), 2600);
    return () => clearTimeout(id);
  }, [result, router]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4 text-center" aria-live="polite">
      {!result && (
        <>
          <span className="flex gap-1.5" aria-hidden>
            {[0, 1, 2].map((i) => (
              <span key={i} className="h-3 w-3 animate-bounce rounded-full bg-ink" style={{ animationDelay: `${i * 120}ms` }} />
            ))}
          </span>
          <p className="text-2xl font-bold tracking-[-0.02em]">Senin için uygun lokali arıyoruz…</p>
          <p className="text-[15px] text-gray">Şehir, semt ve konuya bakıyoruz.</p>
        </>
      )}
      {result && a && (
        <>
          <Avatar name={a.local.name} color={a.local.color} size={88} />
          <p className="text-[28px] font-extrabold leading-8 tracking-[-0.03em]">Sorun {messages.dative(a.local.name)} iletildi</p>
          <p className="flex max-w-sm items-start gap-2 text-left text-[15px] text-ink-2">
            <SystemSquareIcon className="mt-1 shrink-0" />
            {districtName(a.local.homeDistrict)} lokali. Cevap gelmezse sorun otomatik olarak sıradakine geçer.
          </p>
          <Link href={`/soru/${result.question.id}`} className="text-[15px] font-bold underline underline-offset-4">
            Soruyu takip et
          </Link>
        </>
      )}
      {result && !a && (
        <>
          <p className="text-2xl font-bold">Şu an müsait lokal bulamadık</p>
          <p className="text-[15px] text-gray">Sorun açık havuzda; ilk cevap veren lokal sana dönecek.</p>
        </>
      )}
    </div>
  );
}

export function AskForm() {
  const { currentCity } = useMe();
  const { setCity } = useSession();
  const params = useSearchParams();
  const qc = useQueryClient();
  const [text, setText] = useState(params.get("metin") ?? "");
  const [topic, setTopic] = useState<Topic | null>(null);
  const [budget, setBudget] = useState<Budget>("low");
  const [district, setDistrict] = useState<DistrictId | "">("");
  const [dismissed, setDismissed] = useState(false);
  const [enough, setEnough] = useState(false);
  const [showProgress, setShowProgress] = useState(false);
  const [result, setResult] = useState<QuestionSummary | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);
  const topicRef = useRef<HTMLDivElement>(null);
  const districts = CITIES.find((c) => c.id === currentCity)?.districts ?? [];

  const ask = useMutation({
    mutationFn: () =>
      getRepository().askQuestion({ city: currentCity, district: district || null, text, topic: topic!, budget }),
    onSuccess: (r) => {
      void qc.invalidateQueries({ queryKey: qk.myQuestions() });
      // "aranıyor" ara durumu kısa da olsa görünsün
      setTimeout(() => setResult(r), 1200);
    },
    onError: () => setShowProgress(false),
  });

  /** Eksik alan varsa butonu kilitlemek yerine ne eksik olduğunu söyle ve oraya götür. */
  function trySubmit() {
    if (text.trim().length < 10) {
      setFormError("Sorunu biraz daha aç: en az 10 karakter yaz.");
      textRef.current?.focus();
      return;
    }
    if (!topic) {
      setFormError("Bir konu seç, sorunu doğru lokale yönlendirelim.");
      topicRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    setFormError(null);
    setShowProgress(true);
    ask.mutate();
  }

  function submit(e: FormEvent) {
    e.preventDefault();
    trySubmit();
  }

  if (showProgress) {
    return (
      <>
        <AppHeader hideOnMobile />
        <AskProgress result={result} />
      </>
    );
  }

  if (enough) {
    return (
      <>
        <AppHeader hideOnMobile />
        <FlowHeader backHref="/ana-sayfa" title="Lokale sor" />
        <Page className="flex max-w-[640px] flex-col items-center gap-4 py-16 text-center">
          <p className="text-2xl font-bold">Harika, iyi gezmeler!</p>
          <p className="text-[15px] text-gray">Lokaller arşive eklediği cevaplarla sana zaman kazandırdı.</p>
          <ButtonLink href="/ana-sayfa">Ana sayfaya dön</ButtonLink>
        </Page>
      </>
    );
  }

  const where = district ? districtName(district) : null;
  const similarPanel = !dismissed && (
    <SimilarAnswersPanel
      text={text}
      onEnough={() => setEnough(true)}
      onDismiss={() => {
        setDismissed(true);
        trySubmit();
      }}
    />
  );
  return (
    <>
      <AppHeader hideOnMobile />
      <FlowHeader backHref="/ana-sayfa" title="Lokale sor" />
      <Page>
        <h1 className="mb-6 hidden text-[44px] font-extrabold leading-[48px] tracking-[-0.04em] lg:block">Lokale sor</h1>
        {/* Masaüstü: solda form, sağda "Benzer sorular cevaplanmış" paneli (referans: 3-sor-masaustu). */}
        <div className="flex flex-wrap items-start gap-x-14 gap-y-6">
        <form onSubmit={submit} className="flex min-w-0 flex-[1_1_520px] flex-col gap-6 lg:max-w-[752px]">
          <div className="flex items-center justify-between gap-3 rounded-panel bg-mist px-4 py-3 lg:justify-start lg:bg-transparent lg:p-0">
            <span className="text-[13px] text-gray lg:text-base">Şehir</span>
            <CitySelector value={currentCity} onChange={(c) => void setCity(c)} />
          </div>

          <div className="flex flex-col gap-2">
            <FieldLabel htmlFor="q-text">Sorun</FieldLabel>
            <Textarea
              ref={textRef}
              id="q-text"
              rows={3}
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                setDismissed(false);
              }}
              placeholder="Ör. Kadıköy'de öğrenci bütçesine uygun, turistik olmayan bir akşam yemeği yeri?"
              className="border-ink"
            />
          </div>

          <div className="empty:hidden lg:hidden">{similarPanel}</div>

          <div ref={topicRef} className="flex scroll-mt-24 flex-col gap-2">
            <FieldLabel>Konu</FieldLabel>
            <TopicChips
              value={topic}
              onChange={(t) => {
                setTopic(t);
                setFormError(null);
              }}
            />
          </div>

          <div className="grid grid-cols-[auto_1fr] items-end gap-4 lg:grid-cols-[auto_300px] lg:justify-start lg:gap-8">
            <div className="flex flex-col gap-2">
              <FieldLabel>Bütçe</FieldLabel>
              <BudgetSegment value={budget} onChange={setBudget} />
            </div>
            <div className="flex flex-col gap-2">
              <FieldLabel htmlFor="q-district" hint="isteğe bağlı">
                Semt
              </FieldLabel>
              <Select id="q-district" value={district} onChange={(e) => setDistrict(e.target.value)}>
                <option value="">Fark etmez</option>
                {districts.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <ErrorNote error={ask.error ?? (formError ? new Error(formError) : null)} />
          <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:gap-4 lg:border-t lg:border-line lg:pt-6">
            <Button type="submit" disabled={ask.isPending} className="w-full lg:w-auto lg:px-8">
              Lokale gönder
            </Button>
            <p className="text-center text-sm text-gray lg:text-left">
              {!topic
                ? "Göndermek için bir konu seç."
                : `Sorun ${where ? `${where}${locativeSuffix(where)}` : "bu şehirde"} yaşayan bir lokale gider. Cevap gelmezse otomatik olarak sıradakine geçer.`}
            </p>
          </div>
        </form>
        <aside className="hidden min-w-0 flex-[0_1_400px] empty:hidden lg:block">{similarPanel}</aside>
        </div>
      </Page>
    </>
  );
}
