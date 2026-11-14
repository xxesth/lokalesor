// Veri kaynağı seçimi: NEXT_PUBLIC_DATA_SOURCE=mock | http (Faz 2).
// UI sadece buradan import eder; adapter'ları doğrudan import etmez (CLAUDE.md #2).
import type { AuthPort, Clock, DemoControls, Repository } from "./repository";
import { mockAuth } from "./mock/mock-auth";
import { mockDemoControls, mockRepository } from "./mock/mock-repository";
import { startMockScheduler } from "./mock/scheduler";
import { getStore } from "./mock/store";

const source = process.env.NEXT_PUBLIC_DATA_SOURCE ?? "mock";

if (source !== "mock") {
  // Faz 2: data/http/ adapter'ı eklenecek.
  console.warn(`[data] "${source}" kaynağı henüz yok, mock kullanılıyor.`);
}

export function getRepository(): Repository {
  return mockRepository;
}

export function getAuth(): AuthPort {
  return mockAuth;
}

/** Sadece geliştirme / demo. Gerçek arka uçta /api/dev uç noktalarına gider. */
export function getDemoControls(): DemoControls {
  return mockDemoControls;
}

export const clock: Clock = {
  now: () => getStore().now(),
};

/** Saat ya da demo ayarı değişince (zamanı ileri sar, sıfırla) haber ver. */
export function onDataReset(cb: () => void): () => void {
  return getStore().onAnyChange(cb);
}

export function startBackgroundJobs() {
  startMockScheduler();
}

export type { AuthPort, DemoControls, Repository } from "./repository";
