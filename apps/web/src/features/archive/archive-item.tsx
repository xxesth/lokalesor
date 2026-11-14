import type { ArchivedAnswer } from "@lokale/contracts";
import { TOPIC_LABELS } from "@lokale/domain";
import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { SealIcon, ThumbUpIcon } from "@/components/ui/icons";
import { cn } from "@/lib/cn";
import { formatDayMonth } from "@/lib/format";

/** Arşiv kaydı: ana sayfa, benzer cevaplar ve profil ortak kullanır. */
export function ArchiveItem({
  item,
  variant = "list",
  showTopic = true,
  showLocal = true,
}: {
  item: ArchivedAnswer;
  /** list: çizgiyle ayrılmış satır · card: kenarlıklı kart (benzer cevaplar) */
  variant?: "list" | "card";
  showTopic?: boolean;
  showLocal?: boolean;
}) {
  return (
    <article className={cn("flex flex-col gap-2", variant === "card" ? "rounded-card border border-line bg-paper p-4" : "py-5")}>
      {showTopic && <span className="text-[13px] font-semibold text-gray">{TOPIC_LABELS[item.topic]}</span>}
      <h3 className="text-[17px] font-bold leading-[23px] tracking-[-0.01em]">{item.questionText}</h3>
      <p className="text-[15px] leading-[22px] text-ink-2">&ldquo;{item.answer.text}&rdquo;</p>
      <div className="mt-1 flex items-center gap-2 text-[13px]">
        {showLocal && (
          <Link href={`/profil/${item.local.id}`} className="inline-flex items-center gap-2 font-semibold hover:text-ink">
            <Avatar name={item.local.name} color={item.local.color} size={24} />
            {item.local.name}
          </Link>
        )}
        <span className="text-gray">{showLocal ? "· " : ""}{formatDayMonth(item.answer.createdAt)}</span>
        <span className="ml-auto inline-flex items-center gap-1.5 text-ink-2">
          {variant === "card" ? (
            <>
              <SealIcon size={14} /> <span className="font-semibold">Lokal onaylı</span>
            </>
          ) : (
            <>
              <ThumbUpIcon size={14} /> {item.usefulCount} faydalı
            </>
          )}
        </span>
      </div>
    </article>
  );
}
