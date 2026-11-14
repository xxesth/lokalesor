import type { SystemMessage } from "@lokale/contracts";
import { SystemSquareIcon } from "@/components/ui/icons";
import { formatClock } from "@/lib/format";

/** Otomatik mesaj: kutusuz, gri metin, kare ikon, "Otomatik mesaj · saat" (README ilke 2). */
export function AutoMessage({ m }: { m: SystemMessage }) {
  return (
    <div className="flex items-start gap-2.5">
      <SystemSquareIcon className="mt-1 shrink-0" />
      <div className="flex flex-col gap-0.5">
        <span className="text-xs font-semibold text-gray">
          Otomatik mesaj · {formatClock(m.createdAt)}
          {m.kind === "reassigned" && (
            <>
              {" · "}
              <span className="text-nar">Yeniden atandı</span>
            </>
          )}
        </span>
        <span className="text-sm leading-5 text-ink-2">{m.text}</span>
      </div>
    </div>
  );
}
