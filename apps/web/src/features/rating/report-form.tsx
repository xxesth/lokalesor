"use client";
import { REPORT_REASONS, type Id, type ReportReason } from "@lokale/contracts";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { ErrorNote, Textarea } from "@/components/ui/misc";
import { getRepository } from "@/data";

const LABELS: Record<ReportReason, string> = {
  spam: "Spam / reklam",
  wrong_info: "Yanlış bilgi",
  rude: "Kaba dil",
  personal_info: "Kişisel bilgi paylaşımı",
  other: "Diğer",
};

/** Basit şikâyet formu (brief 🟡). Moderasyon kuyruğu Faz 3. */
export function ReportForm({
  answerId,
  author,
  onDone,
}: {
  answerId: Id;
  /** Cevabı yazan lokal; verilirse "engelle" seçeneği çıkar. */
  author?: { id: Id; name: string };
  onDone: () => void;
}) {
  const qc = useQueryClient();
  const [reason, setReason] = useState<ReportReason>("wrong_info");
  const [text, setText] = useState("");
  const [block, setBlock] = useState(false);
  const send = useMutation({
    mutationFn: async () => {
      await getRepository().report({ targetType: "answer", targetId: answerId, reason, description: text });
      if (block && author) await getRepository().blockUser(author.id);
    },
    onSuccess: () => qc.invalidateQueries(),
  });
  if (send.isSuccess) {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-lg font-bold">Şikâyetin alındı</p>
        <p className="text-[15px] text-ink-2">
          Ekibimiz 24 saat içinde inceleyecek.
          {block && author ? ` ${author.name} artık seninle eşleşmeyecek. Engeli Ayarlar'dan kaldırabilirsin.` : ""}
        </p>
        <Button onClick={onDone}>Tamam</Button>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-4">
      <p className="text-lg font-bold">Bu cevabı şikâyet et</p>
      <div className="flex flex-wrap gap-1.5">
        {REPORT_REASONS.map((r) => (
          <Chip key={r} pressed={reason === r} onClick={() => setReason(r)}>
            {LABELS[r]}
          </Chip>
        ))}
      </div>
      <Textarea rows={3} placeholder="İstersen açıkla (isteğe bağlı)" value={text} onChange={(e) => setText(e.target.value)} />
      {author && (
        <label className="flex min-h-11 items-center gap-3 text-[15px]">
          <input type="checkbox" checked={block} onChange={(e) => setBlock(e.target.checked)} className="h-5 w-5 accent-ink" />
          <span>
            {author.name} adlı lokali engelle
            <span className="block text-[13px] text-gray">Birbirinize soru atanmaz. İstediğin zaman kaldırabilirsin.</span>
          </span>
        </label>
      )}
      <ErrorNote error={send.error} />
      <Button onClick={() => send.mutate()} disabled={send.isPending}>
        Gönder
      </Button>
    </div>
  );
}
