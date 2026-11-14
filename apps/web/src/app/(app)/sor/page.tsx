import type { Metadata } from "next";
import { Suspense } from "react";
import { AskForm } from "@/features/ask";

export const metadata: Metadata = { title: "Soru sor" };

export default function Page() {
  return (
    <Suspense>
      <AskForm />
    </Suspense>
  );
}
