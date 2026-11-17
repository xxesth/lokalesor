// Servis başlangıcı: api ve worker `createCore(env)` ile bağlamı kurar, kapanışta `close()` çağırır.
import { createDb } from "@lokale/db";
import type { CoreContext, EffectSink, Logger } from "./context";
import { publish } from "./infra/publish";
import { createDeadlineQueue, scheduleDeadlines } from "./infra/queue";
import { createRedis, type Redis } from "./infra/redis";
import { baseConfig, redisRuntime } from "./runtime";

export interface CoreEnv {
  databaseUrl: string;
  redisUrl: string;
  /** "demo" (T = 3 dk) | "default" (T = 30 dk) */
  config?: string;
  tz?: string;
  /** /dev paneli: zamanı ileri sar ve T ayarı. Production'da false. */
  devOverrides: boolean;
  log: Logger;
  dbPoolMax?: number;
}

export interface Core {
  ctx: CoreContext;
  redis: Redis;
  close(): Promise<void>;
}

export function createCore(env: CoreEnv): Core {
  const { db, pool } = createDb(env.databaseUrl, { max: env.dbPoolMax });
  const redis = createRedis(env.redisUrl);
  const queue = createDeadlineQueue(redis);
  const effects: EffectSink = {
    publish: (channels, at) => publish(redis, channels, at),
    scheduleDeadlines: (jobs, now) => scheduleDeadlines(queue, jobs, now),
  };
  const ctx: CoreContext = {
    db,
    effects,
    runtime: redisRuntime(redis, { cfg: baseConfig(env.config), tz: env.tz ?? "Europe/Istanbul", devOverrides: env.devOverrides }),
    log: env.log,
  };
  return {
    ctx,
    redis,
    async close() {
      await queue.close();
      redis.disconnect();
      await pool.end();
    },
  };
}
