import type { PersonColor } from "@lokale/contracts";
import type { CSSProperties } from "react";

/** Kişi rengi CSS değişkenleri; içeride bg-person / text-person-on kullanılır (ADR-013). */
export function personStyle(color: PersonColor): CSSProperties {
  return {
    ["--person" as string]: `var(--person-${color})`,
    ["--person-on" as string]: `var(--person-${color}-on)`,
  } as CSSProperties;
}

