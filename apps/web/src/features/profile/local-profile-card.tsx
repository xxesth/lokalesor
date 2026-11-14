"use client";
import type { LocalProfile } from "@lokale/contracts";
import { TOPIC_LABELS, cityName, districtName, formatEta, formatRate } from "@lokale/domain";
import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { Tag } from "@/components/ui/chip";
import { LockIcon } from "@/components/ui/icons";
import { VerifiedBadge, VerifiedSeal } from "@/components/ui/verified";
import { cn } from "@/lib/cn";
import { personStyle } from "@/lib/person-color";
import { ArchiveItem } from "@/features/archive";

function place(p: LocalProfile) {
  return [cityName(p.homeCity), districtName(p.homeDistrict)].filter(Boolean).join(" · ");
}

export function LocalStatsRow({ p, size = "s" }: { p: LocalProfile; size?: "s" | "l" }) {
  const items = [
    { value: formatEta(p.stats.medianResponseMinutes) ?? "—", label: "ortalama yanıt", sub: undefined },
    { value: formatRate(p.stats.responseRate), label: "yanıt oranı", sub: "son 30 gün" },
    { value: p.stats.localScore?.toString() ?? "—", label: "Local Score", sub: undefined },
  ];
  if (size === "l") {
    return (
      <dl className="flex flex-col border-t border-ink">
        {items.map((i) => (
          <div key={i.label} className="flex items-end justify-between border-b border-line py-4">
            <dt className="flex flex-col text-base text-ink-2">
              <span className="first-letter:uppercase">{i.label}</span>
              {i.sub && <span className="text-[13px] text-gray">{i.sub}</span>}
            </dt>
            <dd className="tabular text-[56px] font-extrabold leading-[56px] tracking-[-0.04em]">{i.value}</dd>
          </div>
        ))}
      </dl>
    );
  }
  return (
    <dl className="grid grid-cols-3 border-y border-line">
      {items.map((i, idx) => (
        <div key={i.label} className={cn("flex flex-col py-3", idx > 0 && "border-l border-line pl-3")}>
          <dd className="tabular text-[22px] font-bold leading-7 tracking-[-0.02em]">{i.value}</dd>
          <dt className="text-xs text-gray">{i.label}</dt>
        </div>
      ))}
    </dl>
  );
}

/** compact: soru detayının yan sütunu / alttan panel. */
export function LocalProfileCompact({ p }: { p: LocalProfile }) {
  return (
    <section className="overflow-hidden rounded-panel-l border border-line" style={personStyle(p.color)}>
      <div className="h-14 bg-person" />
      <div className="flex flex-col gap-4 px-5 pb-5">
        <div className="-mt-8 flex items-end gap-3">
          <Avatar name={p.name} color={p.color} size={64} ring />
          <div className="flex flex-col pb-1">
            <span className="inline-flex items-center gap-1.5 text-lg font-bold">
              {p.name} {p.verified && <VerifiedSeal />}
            </span>
            <span className="text-[13px] text-gray">{place(p)}</span>
          </div>
        </div>
        <LocalStatsRow p={p} />
        <div className="flex flex-wrap gap-1.5">
          {p.topics.map((t) => (
            <Tag key={t}>{TOPIC_LABELS[t]}</Tag>
          ))}
        </div>
        <Link href={`/profil/${p.id}`} className="text-sm font-bold underline underline-offset-4">
          Profilin tamamını gör
        </Link>
      </div>
    </section>
  );
}

/** full: profil sayfası. İletişim bilgisi YOK. */
export function LocalProfileFull({ p }: { p: LocalProfile }) {
  return (
    <div style={personStyle(p.color)}>
      <div className="h-[140px] bg-person lg:h-[180px]" />
      <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-8 px-4 pb-28 lg:px-6 lg:pb-16">
        <div className="-mt-14 flex flex-col gap-3 lg:-mt-16">
          <Avatar name={p.name} color={p.color} size={112} ring className="lg:h-[120px] lg:w-[120px]" />
          <h1 className="text-[44px] font-extrabold leading-[48px] tracking-[-0.04em]">{p.name}</h1>
          <div className="flex flex-wrap items-center gap-3 text-base text-ink-2">
            {place(p)}
            {p.verified && (
              <span className="rounded-full border border-ink px-3 py-1">
                <VerifiedBadge />
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-10">
          <div className="flex min-w-0 flex-[1_1_360px] flex-col gap-8">
            <LocalStatsRow p={p} size="l" />
            <section className="flex flex-col gap-3">
              <h2 className="text-xl font-bold">Cevapladığı konular</h2>
              <div className="flex flex-wrap gap-2">
                {p.topics.map((t) => (
                  <span key={t} className="rounded-control bg-mist px-3 py-2 text-[15px]">
                    {TOPIC_LABELS[t]}
                  </span>
                ))}
              </div>
            </section>
          </div>
          <div className="flex min-w-0 flex-[1_1_420px] flex-col gap-2">
            <h2 className="text-xl font-bold">Son cevapları</h2>
            {p.recentAnswers.length === 0 && <p className="text-sm text-gray">Henüz arşivlenmiş cevabı yok.</p>}
            <div className="divide-y divide-line border-b border-line">
              {p.recentAnswers.map((a) => (
                <ArchiveItem key={a.answer.id} item={a} showTopic={false} showLocal={false} />
              ))}
            </div>
            <p className="mt-4 flex items-start gap-3 rounded-panel bg-mist p-4 text-[15px] leading-[22px]">
              <LockIcon className="mt-0.5 shrink-0" />
              <span>
                <b>İletişim sadece site içinden.</b> Telefon ve iletişim bilgileri paylaşılmaz.
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
