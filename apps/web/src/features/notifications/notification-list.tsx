"use client";
import type { Notification } from "@lokale/contracts";
import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { SystemSquareIcon } from "@/components/ui/icons";
import { EmptyState, Loading } from "@/components/ui/misc";
import { useNow } from "@/data/use-now";
import { cn } from "@/lib/cn";
import { timeAgo } from "@/lib/format";
import { useSession } from "@/features/session";
import { useNotifications } from "./use-notifications";

function hrefFor(n: Notification, isLocalRole: boolean): string {
  if (n.kind === "new_question") return "/lokal/gelen-kutusu";
  if (n.kind === "assignment_expired" || n.kind === "answer_rated") return isLocalRole ? "/lokal/gelen-kutusu" : `/soru/${n.questionId}`;
  return `/soru/${n.questionId}`;
}

export function NotificationItem({ n, onNavigate }: { n: Notification; onNavigate?: () => void }) {
  const now = useNow();
  const { role } = useSession();
  return (
    <li>
      <Link
        href={hrefFor(n, role === "local")}
        onClick={onNavigate}
        className={cn("flex gap-3 px-4 py-3.5 hover:text-ink", !n.read && "bg-mist")}
      >
        <span className="mt-0.5 flex w-9 shrink-0 justify-center">
          {n.actor ? <Avatar name={n.actor.name} color={n.actor.color} size={32} /> : <span className="mt-1.5"><SystemSquareIcon size={14} /></span>}
        </span>
        <span className="flex min-w-0 flex-1 flex-col gap-1">
          <span className="text-[15px] leading-[21px]">{n.text}</span>
          {n.kind === "new_question" && <span className="text-sm font-bold underline underline-offset-4">Cevapla</span>}
          <span className="text-[13px] text-gray">{now ? timeAgo(n.createdAt, now) : ""}</span>
        </span>
        {!n.read && <span aria-label="Okunmadı" className="mt-2 h-2 w-2 shrink-0 rounded-full bg-nar" />}
      </Link>
    </li>
  );
}

export function NotificationList({ onNavigate }: { onNavigate?: () => void }) {
  const { list, unread, markAll } = useNotifications();
  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between px-4 py-3">
        <span className="text-[15px] font-bold">Bildirimler</span>
        <button
          type="button"
          disabled={unread === 0 || markAll.isPending}
          onClick={() => markAll.mutate()}
          className="h-11 text-sm font-semibold underline underline-offset-4 disabled:opacity-40"
        >
          Tümünü okundu yap
        </button>
      </div>
      {list.isLoading && <Loading />}
      {list.data && list.data.length === 0 && <EmptyState title="Henüz bildirim yok">Yeni bir şey olunca burada göreceksin.</EmptyState>}
      <ul className="divide-y divide-line border-t border-line">
        {list.data?.map((n) => <NotificationItem key={n.id} n={n} onNavigate={onNavigate} />)}
      </ul>
    </div>
  );
}
