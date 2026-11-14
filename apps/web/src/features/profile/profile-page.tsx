"use client";
import type { Id } from "@lokale/contracts";
import { useRouter } from "next/navigation";
import { BackIcon } from "@/components/ui/icons";
import { ErrorNote, Loading } from "@/components/ui/misc";
import { AppHeader } from "@/features/shell";
import { useLocalProfile } from "./hooks";
import { LocalProfileFull } from "./local-profile-card";

export function ProfilePage({ id }: { id: Id }) {
  const profile = useLocalProfile(id);
  const router = useRouter();
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
        <ErrorNote error={profile.error} />
        {profile.data && <LocalProfileFull p={profile.data} />}
      </div>
    </>
  );
}
