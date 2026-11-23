import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/misc";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[560px] flex-col items-center justify-center px-4">
      <EmptyState title="Bu sayfayı bulamadık">
        <p className="mb-4">Adres yanlış olabilir ya da sayfa kaldırılmış olabilir.</p>
        <ButtonLink href="/">Ana sayfaya dön</ButtonLink>
      </EmptyState>
    </main>
  );
}
