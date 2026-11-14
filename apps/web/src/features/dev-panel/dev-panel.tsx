"use client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { getDemoControls } from "@/data";
import { qk } from "@/data/query-keys";
import { useNow } from "@/data/use-now";
import { formatCountdown } from "@lokale/domain";
import { formatClock } from "@/lib/format";

/** Demo araçları: T ayarı, zamanı ileri sar, zamanlayıcıyı çalıştır, sıfırla, atama tablosu. */
export function DevPanel() {
  const qc = useQueryClient();
  const now = useNow();
  const dbg = useQuery({ queryKey: qk.debug(), queryFn: () => getDemoControls().getDebugState(), refetchInterval: 1000 });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function run(label: string, fn: () => Promise<void>) {
    setBusy(true);
    try {
      await fn();
      setMsg(label);
      await qc.invalidateQueries();
    } finally {
      setBusy(false);
    }
  }

  const d = dbg.data;
  return (
    <div className="mx-auto flex max-w-[960px] flex-col gap-8 px-4 py-10 lg:px-6">
      <div className="flex items-center justify-between">
        <h1 className="text-[34px] font-extrabold tracking-[-0.04em]">Geliştirici paneli</h1>
        <Link href="/giris" className="text-[15px] font-bold underline underline-offset-4">
          Girişe dön
        </Link>
      </div>
      <p className="text-[15px] text-ink-2">
        Mock veri tarayıcıda tutulur ve açık bütün pencerelerde ortaktır. Demo öncesi <b>Demoyu sıfırla</b>, sonra bir pencerede Elif, diğerinde Zeynep.
      </p>
      {msg && <p className="rounded-control bg-mist px-3 py-2 text-sm" role="status">✓ {msg}</p>}

      <section className="flex flex-col gap-3">
        <h2 className="border-b border-ink pb-2 text-lg font-bold">Yeniden atama süresi (T)</h2>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[15px]">Şu an: <b>{d?.reassignAfterMinutes ?? "…"} dk</b></span>
          {[1, 3, 5, 30].map((m) => (
            <Button key={m} variant="secondary" size="md" disabled={busy} onClick={() => run(`T = ${m} dk`, () => getDemoControls().setReassignAfterMinutes(m))}>
              {m} dk
            </Button>
          ))}
        </div>
        <p className="text-[13px] text-gray">Yeni atamalara uygulanır. Demo için 3 dk (ADR-015).</p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="border-b border-ink pb-2 text-lg font-bold">Zaman</h2>
        <p className="text-[15px]">
          Saat: <b className="tabular">{now ? formatClock(now) : "…"}</b>
          {d && d.offsetMs > 0 && <span className="text-gray"> (+{Math.round(d.offsetMs / 60000)} dk ileri)</span>}
        </p>
        <div className="flex flex-wrap gap-2">
          {[1, 5, 30].map((m) => (
            <Button key={m} variant="secondary" size="md" disabled={busy} onClick={() => run(`Zaman ${m} dk ileri sarıldı`, () => getDemoControls().advanceTime(m * 60_000))}>
              +{m} dk
            </Button>
          ))}
          <Button variant="secondary" size="md" disabled={busy} onClick={() => run("Süresi dolanlar işlendi", () => getDemoControls().runScheduler())}>
            Zamanlayıcıyı şimdi çalıştır
          </Button>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="border-b border-ink pb-2 text-lg font-bold">Atamalar (bugün + bekleyen)</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-gray">
              <tr>
                <th className="py-2 pr-3 font-semibold">Soru</th>
                <th className="py-2 pr-3 font-semibold">Lokal</th>
                <th className="py-2 pr-3 font-semibold">#</th>
                <th className="py-2 pr-3 font-semibold">Durum</th>
                <th className="py-2 font-semibold">Kalan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {d?.assignments.map((a) => (
                <tr key={a.id}>
                  <td className="max-w-[320px] truncate py-2 pr-3">{a.questionText}</td>
                  <td className="py-2 pr-3">{a.localName}</td>
                  <td className="py-2 pr-3">{a.attempt}</td>
                  <td className="py-2 pr-3">{a.status}</td>
                  <td className="tabular py-2">{a.status === "pending" && now ? formatCountdown(a.deadline - now) : "—"}</td>
                </tr>
              ))}
              {d?.assignments.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-4 text-gray">Bugün atama yok.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="border-b border-ink pb-2 text-lg font-bold">Sıfırla</h2>
        <Button
          disabled={busy}
          onClick={() => {
            if (window.confirm("Tüm demo verisi başa dönsün mü? Açık bütün pencereler etkilenir.")) {
              void run("Demo sıfırlandı", () => getDemoControls().resetDemo());
            }
          }}
          className="self-start bg-nar hover:bg-nar"
        >
          Demoyu sıfırla
        </Button>
      </section>
    </div>
  );
}
