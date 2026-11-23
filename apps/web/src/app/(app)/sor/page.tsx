import type { Metadata } from "next";
import { Suspense } from "react";
import { AskForm } from "@/features/ask";
import { RoleGate } from "@/features/shell";

export const metadata: Metadata = { title: "Soru sor" };

export default function Page() {
  return (
    <RoleGate role="tourist">
      <Suspense>
        <AskForm />
      </Suspense>
    </RoleGate>
  );
}
