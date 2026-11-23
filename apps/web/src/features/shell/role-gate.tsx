"use client";
import type { Role } from "@lokale/contracts";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/misc";
import { Page } from "@/components/layout/two-column";
import { useSession } from "@/features/session";
import { AppHeader } from "./app-header";

const COPY: Record<Role, { title: string; body: string; action: string }> = {
  tourist: {
    title: "Bu ekran Turist modunda",
    body: "Soru sormak için Turist moduna geçmen gerekiyor.",
    action: "Turist moduna geç",
  },
  local: {
    title: "Bu ekran Lokal modunda",
    body: "Sana atanan soruları görmek için Lokal moduna geçmen gerekiyor.",
    action: "Lokal moduna geç",
  },
};

/** Ekran tek bir role aitse, diğer rolde açıklama + geçiş butonu gösterir. */
export function RoleGate({ role, children }: { role: Role; children: ReactNode }) {
  const { role: current, setRole } = useSession();
  if (current === role) return <>{children}</>;
  const c = COPY[role];
  return (
    <>
      <AppHeader />
      <Page>
        <EmptyState title={c.title}>
          <p className="mb-4">{c.body}</p>
          <Button onClick={() => void setRole(role)}>{c.action}</Button>
        </EmptyState>
      </Page>
    </>
  );
}
