// Çalışma zamanı: "şimdi" + iş kuralı parametreleri.
// Geliştirmede /dev paneli (DemoControls) Redis'teki `lokale:runtime` hash'ine yazar:
//   offsetMs → zamanı ileri sar, reassignAfterMinutes → T. Production'da bu hash okunmaz.
import { DEFAULT_CONFIG, DEMO_CONFIG, type Config } from "@lokale/domain";
import type { Redis } from "ioredis";
import type { Runtime, RuntimeSource } from "./context";

export const RUNTIME_KEY = "lokale:runtime";

export interface DevOverrides {
  offsetMs: number;
  reassignAfterMinutes: number | null;
}

export function baseConfig(name: string | undefined): Config {
  return name === "default" ? DEFAULT_CONFIG : DEMO_CONFIG;
}

export function redisRuntime(redis: Redis, opts: { cfg: Config; tz: string; devOverrides: boolean }): RuntimeSource {
  return {
    async load(): Promise<Runtime> {
      if (!opts.devOverrides) return { now: Date.now(), cfg: opts.cfg, tz: opts.tz };
      const o = await readDevOverrides(redis);
      const cfg = o.reassignAfterMinutes ? { ...opts.cfg, reassignAfterMinutes: o.reassignAfterMinutes } : opts.cfg;
      return { now: Date.now() + o.offsetMs, cfg, tz: opts.tz };
    },
  };
}

export async function readDevOverrides(redis: Redis): Promise<DevOverrides> {
  const h = await redis.hgetall(RUNTIME_KEY);
  const t = Number(h.reassignAfterMinutes);
  return { offsetMs: Number(h.offsetMs) || 0, reassignAfterMinutes: t > 0 ? t : null };
}

/** DemoControls.advanceTime: ofseti artırır. Ardından sweepExpired çağrılmalı (süresi dolanlar hemen işlensin). */
export async function advanceDevClock(redis: Redis, ms: number): Promise<void> {
  await redis.hincrby(RUNTIME_KEY, "offsetMs", Math.round(ms));
}

/** DemoControls.setReassignAfterMinutes */
export async function setDevReassignAfterMinutes(redis: Redis, minutes: number): Promise<void> {
  await redis.hset(RUNTIME_KEY, "reassignAfterMinutes", Math.max(1, Math.round(minutes)));
}

/** DemoControls.resetDemo: ofset ve T sıfırlanır (veri sıfırlama ayrıca seed ile yapılır). */
export async function resetDevOverrides(redis: Redis): Promise<void> {
  await redis.del(RUNTIME_KEY);
}

/** Testler için sabit saat. */
export function fixedRuntime(rt: Runtime): RuntimeSource & { set(p: Partial<Runtime>): void } {
  let cur = { ...rt };
  return {
    load: async () => ({ ...cur }),
    set: (p) => {
      cur = { ...cur, ...p };
    },
  };
}
