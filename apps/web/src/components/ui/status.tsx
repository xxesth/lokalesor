import type { QuestionStatus } from "@lokale/contracts";
import { cn } from "@/lib/cn";

export type StatusKind = "delivered" | "with_local" | "reassigned" | "answered" | "open_pool";

export const STATUS_LABELS: Record<StatusKind, string> = {
  delivered: "İletildi",
  with_local: "Lokalde",
  reassigned: "Yeniden atandı",
  answered: "Cevaplandı",
  open_pool: "Açık havuz",
};

export function statusOf(s: QuestionStatus): StatusKind {
  return s === "assigned" ? "with_local" : s === "answered" ? "answered" : s === "open_pool" ? "open_pool" : "delivered";
}

/** Durumlar şekille anlatılır: boş, yarım, dolu daire; nar halka; kesikli daire. */
export function StatusGlyph({ kind, size = 12 }: { kind: StatusKind; size?: number }) {
  const s = { width: size, height: size, viewBox: "0 0 12 12", "aria-hidden": true };
  switch (kind) {
    case "delivered":
      return (<svg {...s}><circle cx="6" cy="6" r="4.5" fill="none" stroke="var(--ink)" strokeWidth="1.6" /></svg>);
    case "with_local":
      return (<svg {...s}><circle cx="6" cy="6" r="4.5" fill="none" stroke="var(--ink)" strokeWidth="1.6" /><path d="M6 1.5a4.5 4.5 0 0 1 0 9z" fill="var(--ink)" /></svg>);
    case "reassigned":
      return (<svg {...s}><circle cx="6" cy="6" r="4" fill="none" stroke="var(--nar)" strokeWidth="2.2" /></svg>);
    case "answered":
      return (<svg {...s}><circle cx="6" cy="6" r="5.5" fill="var(--ink)" /></svg>);
    case "open_pool":
      return (<svg {...s}><circle cx="6" cy="6" r="4.5" fill="none" stroke="var(--gray)" strokeWidth="1.6" strokeDasharray="2 2" /></svg>);
  }
}

export function StatusLabel({ kind, suffix, className }: { kind: StatusKind; suffix?: string; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-sm font-semibold", kind === "open_pool" && "text-gray", kind === "reassigned" && "text-nar", className)}>
      <StatusGlyph kind={kind} />
      {STATUS_LABELS[kind]}
      {suffix}
    </span>
  );
}
