"use client";
import type { CityId } from "@lokale/contracts";
import { CITIES } from "@lokale/domain";
import { ChevronDownIcon } from "@/components/ui/icons";

export function CitySelector({ value, onChange }: { value: CityId; onChange: (c: CityId) => void }) {
  return (
    <label className="relative inline-flex h-11 items-center gap-1.5 rounded-control border border-line-strong bg-paper pl-3.5 pr-9 text-[15px]">
      <span className="text-gray">Şu an:</span>
      <span className="font-bold">{CITIES.find((c) => c.id === value)?.name ?? value}</span>
      <ChevronDownIcon className="pointer-events-none absolute right-3" />
      <select
        aria-label="Bulunduğun şehir"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="absolute -inset-px cursor-pointer text-base opacity-0"
      >
        {CITIES.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>
    </label>
  );
}
