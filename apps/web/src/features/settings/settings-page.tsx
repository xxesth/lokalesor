"use client";
import type { Topic } from "@lokale/contracts";
import { TOPICS } from "@lokale/contracts";
import { CITIES, TOPIC_LABELS, cityName } from "@lokale/domain";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { ErrorNote, FieldLabel, Select } from "@/components/ui/misc";
import { FlowHeader } from "@/components/layout/flow-header";
import { Page } from "@/components/layout/two-column";
import { getRepository } from "@/data";
import { cn } from "@/lib/cn";
import { useMe, useSession } from "@/features/session";
import { AppHeader } from "@/features/shell";
import { BlockedList } from "./blocked-list";

/** Ayarlar (tasarımı yok; stil rehberine göre). Günlük limit brief #4. */
export function SettingsPage() {
  const { user } = useMe();
  const { refresh, signOut } = useSession();
  const qc = useQueryClient();
  const router = useRouter();
  const [limit, setLimit] = useState(user.dailyLimit);
  const [district, setDistrict] = useState(user.homeDistrict ?? "");
  const [interests, setInterests] = useState<Topic[]>(user.interests);
  const save = useMutation({
    mutationFn: () => getRepository().updateSettings({ dailyLimit: limit, homeDistrict: district || null, interests }),
    onSuccess: async () => {
      await refresh();
      await qc.invalidateQueries();
    },
  });
  const districts = CITIES.find((c) => c.id === user.homeCity)?.districts ?? [];

  return (
    <>
      <AppHeader hideOnMobile />
      <FlowHeader backHref={`/profil/${user.id}`} title="Ayarlar" />
      <Page className="flex max-w-[640px] flex-col gap-8">
        <h1 className="hidden text-[44px] font-extrabold tracking-[-0.04em] lg:block">Ayarlar</h1>
        <section className="flex flex-col gap-3">
          <FieldLabel hint="Ankette lokallerin %70'i günde 1-2 soru diyor">Günlük soru limiti</FieldLabel>
          <div role="group" aria-label="Günlük soru limiti" className="inline-flex self-start overflow-hidden rounded-control border border-ink">
            {[1, 2, 3, 4, 5].map((n, i) => (
              <button
                key={n}
                type="button"
                aria-pressed={limit === n}
                onClick={() => setLimit(n)}
                className={cn("h-11 w-12 text-sm font-bold", i > 0 && "border-l border-ink", limit === n ? "bg-ink text-paper" : "bg-paper")}
              >
                {n}
              </button>
            ))}
          </div>
        </section>
        <section className="flex flex-col gap-3">
          <FieldLabel htmlFor="home-district">Lokal olduğun yer</FieldLabel>
          <p className="text-[15px] text-ink-2">{cityName(user.homeCity)}</p>
          <Select id="home-district" value={district} onChange={(e) => setDistrict(e.target.value)}>
            <option value="">Semt seçme</option>
            {districts.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </Select>
        </section>
        <section className="flex flex-col gap-3">
          <FieldLabel>Cevaplamak istediğin konular</FieldLabel>
          <div className="flex flex-wrap gap-1.5">
            {TOPICS.map((t) => (
              <Chip key={t} pressed={interests.includes(t)} onClick={() => setInterests(interests.includes(t) ? interests.filter((x) => x !== t) : [...interests, t])}>
                {TOPIC_LABELS[t]}
              </Chip>
            ))}
          </div>
        </section>
        <BlockedList />
        <ErrorNote error={save.error} />
        {save.isSuccess && <p role="status" className="text-sm text-ink-2">Kaydedildi.</p>}
        <div className="flex items-center justify-between">
          <Button onClick={() => save.mutate()} disabled={save.isPending}>
            Kaydet
          </Button>
          <Button
            variant="text"
            onClick={async () => {
              await signOut();
              router.push("/giris");
            }}
          >
            Çıkış yap
          </Button>
        </div>
      </Page>
    </>
  );
}
