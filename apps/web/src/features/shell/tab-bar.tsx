"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentType } from "react";
import { HomeIcon, InboxIcon, ListIcon, PlusIcon, UserIcon } from "@/components/ui/icons";
import { cn } from "@/lib/cn";
import { personStyle } from "@/lib/person-color";
import { useSession } from "@/features/session";
import { NAV, type NavItem } from "./nav";

const ICONS: Record<NavItem["key"], ComponentType<{ active?: boolean }>> = {
  home: HomeIcon,
  ask: PlusIcon,
  mine: ListIcon,
  inbox: InboxIcon,
  profile: UserIcon,
};

/** Telefonda alt sekme çubuğu. Aktif sekme: üstte 3 px çizgi (turistte siyah, lokalde kişi rengi). */
export function TabBar() {
  const { session, role } = useSession();
  const path = usePathname();
  if (!session) return null;
  return (
    <nav
      aria-label="Ana menü"
      className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-line bg-paper px-1.5 pb-[max(env(safe-area-inset-bottom),12px)] lg:hidden"
      style={personStyle(session.user.color)}
    >
      {NAV.map((n) => {
        const active = n.match(path);
        const Icon = ICONS[n.key];
        return (
          <Link
            key={n.key}
            href={n.href(session.user.id)}
            aria-current={active ? "page" : undefined}
            className={cn(
              "relative flex min-h-14 flex-col items-center justify-center gap-1 text-[11px] hover:text-ink",
              active ? "font-bold text-ink" : "font-medium text-gray",
            )}
          >
            {active && <span aria-hidden className={cn("absolute inset-x-2 top-0 h-[3px]", role === "local" ? "bg-person" : "bg-ink")} />}
            <Icon active={active} />
            {n.label}
          </Link>
        );
      })}
    </nav>
  );
}
