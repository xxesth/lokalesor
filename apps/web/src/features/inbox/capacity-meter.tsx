import type { Capacity, PersonColor } from "@lokale/contracts";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { personStyle } from "@/lib/person-color";

/** "Bugün n/2 soru", kişi rengi segmentler. */
export function CapacityMeter({ capacity, color }: { capacity: Capacity; color: PersonColor }) {
  const full = capacity.used >= capacity.limit;
  return (
    <section className="flex items-center justify-between gap-4 rounded-panel bg-mist px-5 py-4" style={personStyle(color)}>
      <div className="flex flex-col gap-2">
        <span className="text-lg font-bold" aria-label={`Bugün ${capacity.limit} sorudan ${capacity.used} tanesi alındı`}>
          Bugün {capacity.used}/{capacity.limit} soru
        </span>
        <span className="flex gap-1" aria-hidden>
          {Array.from({ length: capacity.limit }, (_, i) => (
            <span key={i} className={cn("h-1.5 w-10 rounded-full", i < capacity.used ? "bg-person" : "border border-line-strong bg-paper")} />
          ))}
        </span>
        {full && <span className="text-[13px] text-gray">Bugünlük kapasiten doldu, yeni soru atanmayacak.</span>}
      </div>
      <Link href="/ayarlar" className="inline-flex min-h-11 items-center text-[15px] font-bold underline underline-offset-4">
        Ayarlar
      </Link>
    </section>
  );
}
