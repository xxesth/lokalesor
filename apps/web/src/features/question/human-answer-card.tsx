import type { Answer, LocalSummary } from "@lokale/contracts";
import { districtName } from "@lokale/domain";
import type { ReactNode } from "react";
import { Avatar } from "@/components/ui/avatar";
import { VerifiedBadge } from "@/components/ui/verified";
import { formatClock } from "@/lib/format";

/** İnsan cevabı: beyaz kart, kenarlık, avatar + ad + mühür + "semt · saat". */
export function HumanAnswerCard({
  answer,
  local,
  responseMinutes,
  action,
}: {
  answer: Answer;
  local: LocalSummary;
  responseMinutes?: number;
  action?: ReactNode;
}) {
  const meta = [districtName(local.homeDistrict), formatClock(answer.createdAt), responseMinutes ? `${responseMinutes} dk'da cevapladı` : null]
    .filter(Boolean)
    .join(" · ");
  return (
    <article className="flex flex-col gap-3 rounded-[4px_14px_14px_14px] border border-line bg-paper p-4 lg:p-5">
      <div className="flex items-center gap-2.5">
        <Avatar name={local.name} color={local.color} size={40} />
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="inline-flex flex-wrap items-center gap-2 text-base font-bold">
            {local.name}
            {local.verified && <VerifiedBadge />}
          </span>
          <span className="text-[13px] text-gray">{meta}</span>
        </div>
        {action}
      </div>
      <p className="text-base leading-6 lg:text-lg lg:leading-[26px]">{answer.text}</p>
    </article>
  );
}
