"use client";
import { REPORT_REASONS, type Id, type ReportReason } from "@lokale/contracts";
import { useMutation } from "@tanstack/react-query";
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
export function ReportForm({ answerId, onDone }: { answerId: Id; onDone: () => void }) {
  const [reason, setReason] = useState<ReportReason>("wrong_info");
  const [text, setText] = useState("");
  const send = useMutation({
    mutationFn: () => getRepository().report({ targetType: "answer", targetId: answerId, reason, description: text }),
  });
  if (send.isSuccess) {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-lg font-bold">Şikâyetin alındı</p>
        <p className="text-[15px] text-ink-2">Ekibimiz 24 saat içinde inceleyecek.</p>
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
      <ErrorNote error={send.error} />
      <Button onClick={() => send.mutate()} disabled={send.isPending}>
        Gönder
      </Button>
    </div>
  );
}
