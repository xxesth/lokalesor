"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { BellIcon } from "@/components/ui/icons";
import { NotificationList } from "./notification-list";
import { useNotifications } from "./use-notifications";

function Count({ n }: { n: number }) {
  if (n === 0) return null;
  return (
    <span className="absolute -right-0.5 -top-0.5 inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-nar px-1 text-[11px] font-bold text-paper ring-2 ring-paper">
      {n > 9 ? "9+" : n}
    </span>
  );
}

/** Telefonda /bildirimler sayfasına gider, masaüstünde açılır kutu. */
export function NotificationBell() {
  const { unread } = useNotifications();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const label = unread ? `Bildirimler, ${unread} okunmamış` : "Bildirimler";

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <Link href="/bildirimler" aria-label={label} className="relative inline-flex h-11 w-11 items-center justify-center lg:hidden">
        <BellIcon />
        <Count n={unread} />
      </Link>
      <button
        type="button"
        aria-label={label}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="relative hidden h-11 w-11 items-center justify-center lg:inline-flex"
      >
        <BellIcon />
        <Count n={unread} />
      </button>
      {open && (
        <div className="absolute right-0 top-12 z-40 max-h-[70vh] w-[400px] overflow-y-auto rounded-panel border border-line bg-paper shadow-pop">
          <NotificationList onNavigate={() => setOpen(false)} />
        </div>
      )}
    </div>
  );
}
