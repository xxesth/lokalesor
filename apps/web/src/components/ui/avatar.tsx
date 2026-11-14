import type { PersonColor } from "@lokale/contracts";
import { cn } from "@/lib/cn";
import { initials } from "@/lib/format";
import { personStyle } from "@/lib/person-color";

/** Kişi rengi dolgu + baş harf. Renk tek başına bilgi taşımaz: yanında hep isim olur. */
export function Avatar({
  name,
  color,
  size = 36,
  className,
  ring,
}: {
  name: string;
  color: PersonColor;
  size?: number;
  className?: string;
  ring?: boolean;
}) {
  return (
    <span
      aria-hidden
      style={{ ...personStyle(color), width: size, height: size, fontSize: Math.round(size * 0.42) }}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full bg-person font-bold text-person-on",
        ring && "ring-2 ring-paper",
        className,
      )}
    >
      {initials(name)}
    </span>
  );
}
