"use client";
import { Button, ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/misc";

/** Beklenmeyen bir ekran hatası: sayfa çökmez, tekrar denenebilir. */
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[560px] flex-col items-center justify-center px-4">
      <EmptyState title="Bir şeyler ters gitti">
        <p className="mb-4">Sayfa açılırken bir sorun çıktı. Tekrar deneyebilirsin.</p>
        <div className="flex flex-wrap justify-center gap-2">
          <Button onClick={reset}>Tekrar dene</Button>
          <ButtonLink href="/" variant="secondary">
            Ana sayfaya dön
          </ButtonLink>
        </div>
      </EmptyState>
    </main>
  );
}
