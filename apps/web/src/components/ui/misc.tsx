"use client";
import { isRepoError } from "@lokale/contracts";
import { useEffect, useRef, type ComponentProps, type ReactNode, type SelectHTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import { CloseIcon } from "./icons";

export function SectionTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex items-end justify-between gap-3 border-b border-ink pb-2.5">
      <h2 className="text-xl font-bold leading-[26px] tracking-[-0.02em]">{children}</h2>
      {action}
    </div>
  );
}

export function EmptyState({ icon, title, children }: { icon?: ReactNode; title: string; children?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
      {icon}
      <p className="text-lg font-bold">{title}</p>
      {children && <div className="max-w-sm text-sm text-gray">{children}</div>}
    </div>
  );
}

export function Textarea({ className, ...p }: ComponentProps<"textarea">) {
  return (
    <textarea
      className={cn(
        "w-full resize-none rounded-control border border-line-strong bg-paper px-3.5 py-3 text-base leading-6 placeholder:text-gray focus:border-ink",
        className,
      )}
      {...p}
    />
  );
}

export function Select({ className, children, ...p }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn("h-11 w-full rounded-control border border-line-strong bg-paper px-3 text-base focus:border-ink", className)}
      {...p}
    >
      {children}
    </select>
  );
}

export function FieldLabel({ children, htmlFor, hint }: { children: ReactNode; htmlFor?: string; hint?: string }) {
  return (
    <label htmlFor={htmlFor} className="flex items-baseline justify-between text-sm font-bold">
      {children}
      {hint && <span className="text-[13px] font-normal text-gray">{hint}</span>}
    </label>
  );
}

const FOCUSABLE = "a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex='-1'])";

/** Telefonda alttan açılan panel. Açılınca odak içeri girer, Tab panelde döner, kapanınca odak geri döner. */
export function Sheet({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  const panel = useRef<HTMLDivElement>(null);
  // onClose çoğu yerde satır içi veriliyor; efekt her render'da yeniden kurulup odağı çalmasın.
  const closeRef = useRef(onClose);
  useEffect(() => {
    closeRef.current = onClose;
  });
  useEffect(() => {
    if (!open) return;
    const before = document.activeElement as HTMLElement | null;
    const items = () => [...(panel.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? [])];
    // Kapat düğmesi paneldeki ilk odaklanabilir öğe.
    items()[0]?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") return closeRef.current();
      if (e.key !== "Tab") return;
      const list = items();
      if (list.length === 0) return;
      const first = list[0]!;
      const last = list[list.length - 1]!;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      before?.focus();
    };
  }, [open]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end" role="dialog" aria-modal="true" aria-label={title}>
      <button type="button" aria-label="Kapat" className="absolute inset-0 bg-scrim" onClick={onClose} />
      <div ref={panel} className="relative max-h-[85vh] w-full overflow-y-auto rounded-t-sheet bg-paper px-4 pb-8 pt-3 shadow-pop">
        <div className="mx-auto mb-2 h-1 w-10 rounded-full bg-line-strong" />
        <div className="flex justify-end">
          <button type="button" onClick={onClose} aria-label="Kapat" className="inline-flex h-11 w-11 items-center justify-center">
            <CloseIcon />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

/** Hata kutusu. Nar kırmızısı sadece aciliyet içindir (kural 9), hata için siyah kenarlık. */
export function ErrorNote({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  if (!error) return null;
  const msg = error instanceof Error && error.message ? error.message : "Bir şeyler ters gitti.";
  // Soru/profil yoksa ya da yetki yoksa tekrar denemek işe yaramaz.
  const retryable = !(isRepoError(error) && (error.code === "NOT_FOUND" || error.code === "FORBIDDEN"));
  return (
    <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-control border border-ink px-3 py-2.5 text-sm">
      <span>{msg}</span>
      {onRetry && retryable && (
        <button type="button" onClick={onRetry} className="inline-flex min-h-11 items-center font-bold underline underline-offset-4">
          Tekrar dene
        </button>
      )}
    </div>
  );
}

export function Loading({ label = "Yükleniyor…" }: { label?: string }) {
  return (
    <p role="status" className="py-8 text-center text-sm text-gray">
      {label}
    </p>
  );
}
