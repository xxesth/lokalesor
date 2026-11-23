import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Masaüstü: en fazla 1200 px, iki sütun; dar ekranda alt alta düşer (README Düzen). */
export function Page({ children, className }: { children: ReactNode; className?: string }) {
  // cn() sınıfları birleştirmez; sayfa kendi max-w değerini verdiyse varsayılanı eklemeyiz.
  const maxW = className?.includes("max-w-") ? "" : "max-w-[1248px]";
  return (
    <main id="icerik" tabIndex={-1} className={cn("mx-auto w-full px-4 pb-28 pt-5 focus:outline-none lg:px-6 lg:pb-16 lg:pt-8", maxW, className)}>
      {children}
    </main>
  );
}

export function TwoColumn({ main, side, className }: { main: ReactNode; side: ReactNode; className?: string }) {
  return (
    <div className={cn("flex flex-wrap gap-8 lg:gap-12", className)}>
      <div className="flex min-w-0 flex-[999_1_560px] flex-col gap-8">{main}</div>
      <aside className="flex min-w-0 flex-[1_1_340px] flex-col gap-6">{side}</aside>
    </div>
  );
}
