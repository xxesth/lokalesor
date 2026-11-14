"use client";
import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { Loading } from "@/components/ui/misc";
import { useSession } from "@/features/session";
import { TabBar } from "@/features/shell";

/** Oturum yoksa /giris'e yönlendir. Üst menü sayfa içinde (akış ekranlarında telefonda FlowHeader). */
export default function AppLayout({ children }: { children: ReactNode }) {
  const { session, loading } = useSession();
  const router = useRouter();
  useEffect(() => {
    if (!loading && !session) router.replace("/giris");
  }, [loading, session, router]);
  if (loading || !session) return <Loading />;
  return (
    <>
      {children}
      <TabBar />
    </>
  );
}
