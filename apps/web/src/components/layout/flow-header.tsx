"use client";
import Link from "next/link";
import type { ReactNode } from "react";
import { BackIcon } from "@/components/ui/icons";

/** Akış ekranlarında telefonda üst menü yerine: geri oku + başlık (README Düzen). */
export function FlowHeader({ backHref, title, subtitle, right }: { backHref: string; title: string; subtitle?: string; right?: ReactNode }) {
  return (
    <header className="sticky top-0 z-30 flex items-center gap-1.5 border-b border-line bg-paper px-4 py-2.5 lg:hidden">
      <Link href={backHref} aria-label="Geri" className="-ml-2.5 inline-flex h-11 w-11 items-center justify-center">
        <BackIcon />
      </Link>
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-lg font-bold">{title}</span>
        {subtitle && <span className="truncate text-[13px] text-gray">{subtitle}</span>}
      </div>
      {right}
    </header>
  );
}

/** Masaüstünde geri bağlantısı. */
export function BackLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="hidden min-h-11 items-center gap-1 text-[15px] font-semibold text-ink-2 lg:inline-flex">
      <BackIcon size={16} />
      {children}
    </Link>
  );
}
