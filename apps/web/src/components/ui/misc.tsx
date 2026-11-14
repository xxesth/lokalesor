"use client";
import { useEffect, type ReactNode, type TextareaHTMLAttributes, type SelectHTMLAttributes } from "react";
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

export function Textarea({ className, ...p }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "w-full resize-none rounded-control border border-line-strong bg-paper px-3.5 py-3 text-base leading-6 placeholder:text-gray focus:border-ink focus:outline-none",
        className,
      )}
      {...p}
    />
  );
}

export function Select({ className, children, ...p }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn("h-11 w-full rounded-control border border-line-strong bg-paper px-3 text-base focus:border-ink focus:outline-none", className)}
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

/** Telefonda alttan açılan panel. */
export function Sheet({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end" role="dialog" aria-modal="true" aria-label={title}>
      <button type="button" aria-label="Kapat" className="absolute inset-0 bg-scrim" onClick={onClose} />
      <div className="relative max-h-[85vh] w-full overflow-y-auto rounded-t-sheet bg-paper px-4 pb-8 pt-3 shadow-pop">
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

export function ErrorNote({ error }: { error: unknown }) {
  if (!error) return null;
  const msg = error instanceof Error ? error.message : "Bir şeyler ters gitti.";
  return (
    <p role="alert" className="rounded-control border border-nar px-3 py-2 text-sm text-nar">
      {msg}
    </p>
  );
}

export function Loading({ label = "Yükleniyor…" }: { label?: string }) {
  return <p className="py-8 text-center text-sm text-gray">{label}</p>;
}
