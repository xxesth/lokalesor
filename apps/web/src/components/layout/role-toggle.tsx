"use client";
import type { PersonColor, Role } from "@lokale/contracts";
import { cn } from "@/lib/cn";
import { personStyle } from "@/lib/person-color";

/** Turist/Lokal anahtarı. Lokal aktifken kişi rengi noktası. */
export function RoleToggle({ role, color, onChange }: { role: Role; color: PersonColor; onChange: (r: Role) => void }) {
  const item = (r: Role, label: string) => (
    <button
      type="button"
      aria-pressed={role === r}
      onClick={() => role !== r && onChange(r)}
      className={cn(
        "inline-flex h-[38px] items-center gap-2 rounded-[7px] px-3.5 text-sm",
        role === r ? "bg-paper font-bold text-ink shadow-[0_0_0_1px_var(--line-strong)]" : "font-semibold text-gray",
      )}
    >
      {r === "local" && role === "local" && <span aria-hidden className="h-2 w-2 rounded-full bg-person" />}
      {label}
    </button>
  );
  return (
    <div role="group" aria-label="Rol" className="inline-flex rounded-[10px] bg-mist p-[3px]" style={personStyle(color)}>
      {item("tourist", "Turist")}
      {item("local", "Lokal")}
    </div>
  );
}
