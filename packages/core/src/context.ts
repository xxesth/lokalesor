// Core'un dış dünyaya bağımlılıkları tek nesnede. api ve worker başlarken bir kez createCore() çağırır;
// testler aynı arayüzü sahte yan etki ve sabit saatle kurar (src/test/harness.ts).
import type { Channel } from "@lokale/contracts";
import type { Db } from "@lokale/db";
import type { Config } from "@lokale/domain";

/** pino ile uyumlu en küçük arayüz. */
export interface Logger {
  info(obj: object, msg?: string): void;
  warn(obj: object, msg?: string): void;
  error(obj: object, msg?: string): void;
}

export interface DeadlineJob {
  assignmentId: string;
  /** epoch ms (sunucu saati; dev ofseti dahil) */
  deadline: number;
}

/** Commit'ten sonra çalışan yan etkiler (CLAUDE.md #7). */
export interface EffectSink {
  publish(channels: Channel[], at: number): Promise<void>;
  scheduleDeadlines(jobs: DeadlineJob[], now: number): Promise<void>;
}

export interface Runtime {
  /** sunucu "şimdi"si (geliştirmede ileri sarılabilir) */
  now: number;
  cfg: Config;
  /** "bugün" sınırının saat dilimi */
  tz: string;
}

export interface RuntimeSource {
  load(): Promise<Runtime>;
}

export interface CoreContext {
  db: Db;
  effects: EffectSink;
  runtime: RuntimeSource;
  log: Logger;
}
