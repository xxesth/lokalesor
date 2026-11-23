"use client";
import type { User } from "@lokale/contracts";
import { TOPIC_LABELS, cityName, districtName, locativeSuffix } from "@lokale/domain";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { getAuth } from "@/data";
import { qk } from "@/data/query-keys";
import { Avatar } from "@/components/ui/avatar";
import { Tag } from "@/components/ui/chip";
import { ErrorNote, Loading } from "@/components/ui/misc";
import { VerifiedSeal } from "@/components/ui/verified";
import { useSession } from "./session-provider";

/** Pilot şehir İstanbul: İstanbullular lokal, diğerleri turist olarak gelir. */
const isLocal = (u: User) => u.homeCity === "istanbul";

function describe(u: User): string {
  if (isLocal(u)) return [cityName(u.homeCity), districtName(u.homeDistrict)].filter(Boolean).join(" · ");
  const city = cityName(u.homeCity);
  return `${city}${locativeSuffix(city)}n · şu an İstanbul${locativeSuffix("İstanbul")}`;
}

export function DemoUserPicker() {
  const { signIn } = useSession();
  const router = useRouter();
  const [error, setError] = useState<unknown>(null);
  const users = useQuery({ queryKey: qk.demoUsers(), queryFn: () => getAuth().listDemoUsers() });

  async function pick(u: User) {
    try {
      const s = await signIn(u.id);
      router.push(s.user.homeCity === s.currentCity ? "/lokal/gelen-kutusu" : "/ana-sayfa");
    } catch (e) {
      setError(e);
    }
  }

  return (
    <main id="icerik" tabIndex={-1} className="mx-auto flex w-full max-w-[1248px] flex-col gap-8 px-4 py-10 focus:outline-none lg:flex-row lg:items-start lg:gap-14 lg:px-6 lg:py-16">
      <div className="flex flex-col gap-5 lg:w-[340px] lg:shrink-0">
        <h1 className="text-[28px] font-extrabold leading-8 tracking-[-0.03em] lg:text-[52px] lg:leading-[54px] lg:tracking-[-0.04em]">
          Kim olarak devam etmek istersin?
        </h1>
        <p className="text-base text-ink-2 lg:text-lg">Bir kişi seç, uygulamayı onun gözünden dene. Turistler soru sorar, lokaller cevaplar.</p>
        <p className="rounded-panel bg-mist p-4 text-[15px] leading-[22px] text-ink-2">
          <b className="text-ink">Demo modu.</b> İki pencerede farklı kullanıcı seçebilirsin. Birinde Efe Genç olarak sor, ötekinde Mert Özçelik olarak cevapla.
        </p>
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-4">
        <ErrorNote error={error} />
        <ErrorNote error={users.error} onRetry={() => void users.refetch()} />
        {users.isLoading && <Loading />}
        <ul className="grid content-start gap-3 sm:grid-cols-2">
          {users.data?.map((u) => (
            <li key={u.id}>
              <button
                type="button"
                onClick={() => void pick(u)}
                className="flex h-full w-full items-start gap-4 rounded-card border border-line bg-paper p-4 text-left transition-colors hover:border-ink"
              >
                <Avatar name={u.name} color={u.color} size={56} />
                <span className="flex min-w-0 flex-1 flex-col gap-1.5">
                  <span className="flex items-start justify-between gap-2">
                    <span className="text-lg font-bold leading-6">
                      {u.name}
                      {u.verified && (
                        <span className="ml-1.5 inline-block align-middle">
                          <VerifiedSeal />
                        </span>
                      )}
                    </span>
                    <span className="shrink-0 pt-1 text-xs font-semibold text-gray">{isLocal(u) ? "Lokal" : "Turist"}</span>
                  </span>
                  <span className="text-[15px] text-ink-2">{describe(u)}</span>
                  <span className="flex flex-wrap gap-1">
                    {u.interests.map((t) => (
                      <Tag key={t}>{TOPIC_LABELS[t]}</Tag>
                    ))}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
