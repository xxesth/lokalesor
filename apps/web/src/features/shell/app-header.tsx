"use client";
import type { Role } from "@lokale/contracts";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { CitySelector } from "@/components/layout/city-selector";
import { RoleToggle } from "@/components/layout/role-toggle";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/cn";
import { personStyle } from "@/lib/person-color";
import { NotificationBell } from "@/features/notifications";
import { useSession } from "@/features/session";
import { NAV } from "./nav";

export function Logo() {
  return (
    <Link href="/" className="inline-flex min-h-11 items-center hover:text-ink" aria-label="Lokale Sor ana sayfa">
      <span className="inline-flex items-baseline gap-0.5">
        <span className="text-[26px] font-extrabold tracking-[-0.03em]">Lokale Sor</span>
        <span aria-hidden className="h-2 w-2 rounded-full bg-nar" />
      </span>
    </Link>
  );
}

/** Telefonda iki satır, masaüstünde tek satır + metin sekmeleri. */
export function AppHeader({ hideOnMobile }: { hideOnMobile?: boolean }) {
  const { session, role, setRole, setCity } = useSession();
  const router = useRouter();
  const path = usePathname();
  if (!session) return null;
  const { user, currentCity } = session;

  async function changeRole(r: Role) {
    await setRole(r);
    router.push(r === "local" ? "/lokal/gelen-kutusu" : "/ana-sayfa");
  }

  const avatar = (
    <Link href={`/profil/${user.id}`} aria-label={`Profil: ${user.name}`} className="inline-flex h-11 w-11 items-center justify-center">
      <Avatar name={user.name} color={user.color} size={40} />
    </Link>
  );

  return (
    <header className={cn("border-b border-line bg-paper", hideOnMobile && "hidden lg:block")} style={personStyle(user.color)}>
      {/* Telefon */}
      <div className="flex flex-col gap-3 px-4 pb-3.5 pt-3 lg:hidden">
        <div className="flex items-center justify-between">
          <Logo />
          <div className="flex items-center gap-1">
            <NotificationBell />
            {avatar}
          </div>
        </div>
        <div className="flex items-center justify-between gap-2">
          <CitySelector value={currentCity} onChange={(c) => void setCity(c)} />
          <RoleToggle role={role} color={user.color} onChange={(r) => void changeRole(r)} />
        </div>
      </div>
      {/* Masaüstü */}
      <div className="mx-auto hidden max-w-[1200px] flex-col px-6 lg:flex">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center py-3.5">
          <Logo />
          <CitySelector value={currentCity} onChange={(c) => void setCity(c)} />
          <div className="flex items-center justify-end gap-2">
            <RoleToggle role={role} color={user.color} onChange={(r) => void changeRole(r)} />
            <NotificationBell />
            {avatar}
          </div>
        </div>
        <nav aria-label="Ana menü" className="flex gap-7">
          {NAV.filter((n) => n.key !== "profile").map((n) => {
            const active = n.match(path);
            return (
              <Link
                key={n.key}
                href={n.href(user.id)}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "inline-flex min-h-11 items-center border-b-2 text-[15px] hover:text-ink",
                  active ? cn("font-bold", role === "local" ? "border-person" : "border-ink") : "border-transparent text-ink-2",
                )}
              >
                {n.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
