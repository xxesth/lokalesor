"use client";
import type { Budget, DistrictId, QuestionSummary, Topic } from "@lokale/contracts";
import { CITIES, districtName, locativeSuffix, messages } from "@lokale/domain";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Button, ButtonLink } from "@/components/ui/button";
import { BudgetSegment, TopicChips } from "@/components/ui/chip";
import { CitySelector } from "@/components/layout/city-selector";
import { BackLink, FlowHeader } from "@/components/layout/flow-header";
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

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!topic) return;
    setShowProgress(true);
    ask.mutate();
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
  return (
    <>
      <AppHeader hideOnMobile />
      <FlowHeader backHref="/ana-sayfa" title="Lokale sor" />
      <Page className="max-w-[760px]">
        <BackLink href="/ana-sayfa">Ana sayfa</BackLink>
        <h1 className="mb-6 mt-3 hidden text-[44px] font-extrabold leading-[48px] tracking-[-0.04em] lg:block">Lokale sor</h1>
        <form onSubmit={submit} className="flex flex-col gap-6">
          <div className="flex items-center justify-between gap-3 rounded-panel bg-mist px-4 py-3">
            <span className="flex flex-col">
              <span className="text-[13px] text-gray">Şehir</span>
            </span>
            <CitySelector value={currentCity} onChange={(c) => void setCity(c)} />
          </div>

          <div className="flex flex-col gap-2">
            <FieldLabel htmlFor="q-text">Sorun</FieldLabel>
            <Textarea
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

          {!dismissed && <SimilarAnswersPanel text={text} onEnough={() => setEnough(true)} onDismiss={() => setDismissed(true)} />}

          <div className="flex flex-col gap-2">
            <FieldLabel>Konu</FieldLabel>
            <TopicChips value={topic} onChange={setTopic} />
          </div>

          <div className="grid grid-cols-[auto_1fr] items-end gap-4">
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

          <ErrorNote error={ask.error} />
          <div className="flex flex-col gap-2">
            <Button type="submit" disabled={!topic || text.trim().length < 10 || ask.isPending} className="w-full">
              Lokale gönder
            </Button>
            <p className="text-center text-sm text-gray">
              {!topic
                ? "Göndermek için bir konu seç."
                : `Sorun ${where ? `${where}${locativeSuffix(where)}` : "bu şehirde"} yaşayan bir lokale gider. Cevap gelmezse otomatik olarak sıradakine geçer.`}
            </p>
          </div>
        </form>
      </Page>
    </>
  );
}
