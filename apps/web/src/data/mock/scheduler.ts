// Yeniden atama zamanlayıcısı (worker'ın tarayıcı karşılığı).
// Birden fazla sekme açıkken sadece biri çalıştırır: Web Locks ile lider seçimi.
import { runExpireDue } from "./mock-repository";

const LOCK = "lokale:mock:scheduler";
const INTERVAL_MS = 2_000;
let started = false;

export function startMockScheduler() {
  if (started || typeof window === "undefined") return;
  started = true;
  const loop = () => {
    const id = window.setInterval(() => {
      void runExpireDue().catch((e: unknown) => console.error("[scheduler]", e));
    }, INTERVAL_MS);
    return id;
  };
  if (navigator.locks) {
    // Kilit sekme açık kaldıkça tutulur; sekme kapanınca başka sekme devralır.
    void navigator.locks.request(LOCK, () => {
      loop();
      return new Promise<void>(() => {});
    });
  } else {
    loop();
  }
}
