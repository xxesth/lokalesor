// withTx: transaction + commit sonrası yayın ve kuyruk (CLAUDE.md #6, #7).
// Use-case içinde Redis'e ya da kuyruğa DOĞRUDAN yazılmaz; tx.publish / tx.scheduleDeadline kullanılır.
// Rollback olursa hiçbiri gönderilmez. Commit sonrası gönderim hata verirse loglanır, fırlatılmaz:
// kaçan bir sinyali istemcinin periyodik tazelemesi, kaçan bir süre işini yedek tarama yakalar (ADR-020).
import type { Channel } from "@lokale/contracts";
import type { DbTx } from "@lokale/db";
import type { Config } from "@lokale/domain";
import type { CoreContext, DeadlineJob } from "./context";

export interface Tx {
  db: DbTx;
  /** transaction boyunca sabit "şimdi" */
  now: number;
  cfg: Config;
  tz: string;
  publish(channel: Channel): void;
  scheduleDeadline(job: DeadlineJob): void;
}

export async function withTx<T>(ctx: CoreContext, fn: (tx: Tx) => Promise<T>): Promise<T> {
  const rt = await ctx.runtime.load();
  const channels = new Set<Channel>();
  const jobs: DeadlineJob[] = [];

  const result = await ctx.db.transaction(async (db) =>
    fn({
      db,
      now: rt.now,
      cfg: rt.cfg,
      tz: rt.tz,
      publish: (c) => channels.add(c),
      scheduleDeadline: (j) => jobs.push(j),
    }),
  );

  // --- commit edildi ---
  if (jobs.length) {
    await ctx.effects.scheduleDeadlines(jobs, rt.now).catch((err: unknown) => {
      ctx.log.error({ err, jobs: jobs.map((j) => j.assignmentId) }, "süre işi kuyruğa eklenemedi; yedek tarama yakalayacak");
    });
  }
  if (channels.size) {
    await ctx.effects.publish([...channels], rt.now).catch((err: unknown) => {
      ctx.log.error({ err, channels: [...channels] }, "realtime yayını yapılamadı");
    });
  }
  return result;
}
