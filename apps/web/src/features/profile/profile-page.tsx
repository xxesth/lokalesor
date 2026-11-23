"use client";
import type { Id } from "@lokale/contracts";
import { useRouter } from "next/navigation";
import { BackIcon } from "@/components/ui/icons";
import { ButtonLink } from "@/components/ui/button";
import { ErrorNote, Loading } from "@/components/ui/misc";
import { useSession } from "@/features/session";
import { AppHeader } from "@/features/shell";
import { useLocalProfile } from "./hooks";
import { LocalProfileFull } from "./local-profile-card";

export function ProfilePage({ id }: { id: Id }) {
  const profile = useLocalProfile(id);
  const router = useRouter();
  const { session } = useSession();
  const own = session?.user.id === id;
  return (
    <>
      <AppHeader hideOnMobile />
      <div className="relative">
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="Geri"
          className="absolute left-2 top-2 z-10 inline-flex h-11 w-11 items-center justify-center lg:hidden"
        >
          <BackIcon />
        </button>
        {profile.isLoading && <Loading />}
        <ErrorNote error={profile.error} onRetry={() => void profile.refetch()} />
        {profile.data && (
          <LocalProfileFull
            p={profile.data}
            actions={
              own && (
                <nav aria-label="Profil işlemleri" className="flex flex-wrap gap-2 pt-1">
                  <ButtonLink href="/ayarlar" variant="secondary" size="md">
                    Ayarlar
                  </ButtonLink>
                  <ButtonLink href="/lokal/arsiv" variant="secondary" size="md">
                    Soru arşivim
                  </ButtonLink>
                </nav>
              )
            }
          />
        )}
      </div>
    </>
  );
}
