"use client";
import type { User } from "@lokale/contracts";
import { TOPIC_LABELS, cityName, districtName, locativeSuffix } from "@lokale/domain";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { getAuth } from "@/data";
import { qk } from "@/data/query-keys";
import { Avatar } from "@/components/ui/avatar";
import { ErrorNote, Loading } from "@/components/ui/misc";
import { VerifiedSeal } from "@/components/ui/verified";
import { useSession } from "./session-provider";

/** Pilot şehir İstanbul: İstanbullular lokal, diğerleri turist olarak gelir. */
function describe(u: User): string {
  const home = [districtName(u.homeDistrict), cityName(u.homeCity)].filter(Boolean).join(", ");
  const city = cityName(u.homeCity);
  return u.homeCity === "istanbul" ? `${home} · lokal` : `${city}${locativeSuffix(city)}n geliyor · turist`;
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
    <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-8 px-4 py-10 lg:px-6 lg:py-16">
      <div className="flex flex-col gap-3">
        <h1 className="text-[28px] font-extrabold leading-8 tracking-[-0.03em] lg:text-[44px] lg:leading-[48px]">
          Kim olarak devam etmek istersin?
        </h1>
        <p className="text-base text-ink-2">Demo modu: iki pencerede farklı kullanıcı seçebilirsin. Biri sorsun, diğeri cevaplasın.</p>
      </div>
      <ErrorNote error={error} />
      <ErrorNote error={users.error} onRetry={() => void users.refetch()} />
      {users.isLoading && <Loading />}
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {users.data?.map((u) => (
          <li key={u.id}>
            <button
              type="button"
              onClick={() => void pick(u)}
              className="flex w-full items-center gap-4 rounded-card border border-line bg-paper p-4 text-left transition-colors hover:border-ink"
            >
              <Avatar name={u.name} color={u.color} size={56} />
              <span className="flex min-w-0 flex-1 flex-col gap-1">
                <span className="inline-flex items-center gap-1.5 text-lg font-bold">
                  {u.name}
                  {u.verified && <VerifiedSeal />}
                </span>
                <span className="text-[13px] text-gray">{describe(u)}</span>
                <span className="truncate text-[13px] text-ink-2">{u.interests.map((t) => TOPIC_LABELS[t]).join(" · ")}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
