// Entegrasyon testi düzeneği: gerçek Postgres (docker compose), sahte yan etkiler, sabit saat.
// Veritabanı: TEST_DATABASE_URL (varsayılan lokale_test). Her test dosyası başında şema sıfırlanır.
// Postgres yoksa testler atlanır (CI=true iken hata verir), böylece docker'sız ekip üyesi `pnpm test` çalıştırabilir.
import type { Channel, PersonColor, Topic } from "@lokale/contracts";
import { createDb, runMigrations, users, type DbHandle } from "@lokale/db";
import { DEMO_CONFIG, type Config } from "@lokale/domain";
import { sql } from "drizzle-orm";
import type { CoreContext, DeadlineJob, Logger } from "../context";
import { fixedRuntime } from "../runtime";

export const TEST_DB_URL = process.env.TEST_DATABASE_URL ?? "postgres://lokale:lokale@localhost:5432/lokale_test";

export async function dbAvailable(): Promise<boolean> {
  const { pool } = createDb(TEST_DB_URL, { max: 1 });
  try {
    await pool.query("select 1");
    return true;
  } catch (err) {
    if (process.env.CI) throw err;
    console.warn(`[core] test veritabanına bağlanılamadı (${TEST_DB_URL}); entegrasyon testleri atlanıyor. docker compose up -d`);
    return false;
  } finally {
    await pool.end();
  }
}

export async function resetDb(): Promise<void> {
  const { pool } = createDb(TEST_DB_URL, { max: 1 });
  try {
    await pool.query("drop schema if exists public cascade; drop schema if exists drizzle cascade; create schema public;");
  } finally {
    await pool.end();
  }
  await runMigrations(TEST_DB_URL);
}

const silent: Logger = { info() {}, warn() {}, error() {} };

/** 2026-11-17 12:00 İstanbul */
export const T0 = Date.UTC(2026, 10, 17, 9, 0, 0);

export interface TestCore {
  ctx: CoreContext;
  handle: DbHandle;
  published: Channel[][];
  scheduled: DeadlineJob[];
  clock: ReturnType<typeof fixedRuntime>;
  close(): Promise<void>;
}

export function createTestCore(cfg: Config = DEMO_CONFIG): TestCore {
  const handle = createDb(TEST_DB_URL, { max: 8 });
  const published: Channel[][] = [];
  const scheduled: DeadlineJob[] = [];
  const clock = fixedRuntime({ now: T0, cfg, tz: "Europe/Istanbul" });
  const ctx: CoreContext = {
    db: handle.db,
    log: silent,
    runtime: clock,
    effects: {
      publish: async (channels) => void published.push(channels),
      scheduleDeadlines: async (jobs) => void scheduled.push(...jobs),
    },
  };
  return { ctx, handle, published, scheduled, clock, close: () => handle.pool.end() };
}

export async function truncateAll(t: TestCore): Promise<void> {
  await t.handle.db.execute(
    sql`truncate users, questions, assignments, answers, ratings, system_messages, notifications, reports, blocks cascade`,
  );
  t.published.length = 0;
  t.scheduled.length = 0;
}

export async function insertUser(
  t: TestCore,
  u: { id: string; city?: string; district?: string | null; interests?: Topic[]; dailyLimit?: number; color?: PersonColor },
): Promise<void> {
  await t.handle.db.insert(users).values({
    id: u.id,
    name: u.id[0]!.toUpperCase() + u.id.slice(1),
    email: `${u.id}@demo.local`,
    color: u.color ?? "kobalt",
    homeCity: u.city ?? "istanbul",
    homeDistrict: u.district ?? null,
    interests: u.interests ?? [],
    dailyLimit: u.dailyLimit ?? 2,
    createdAt: new Date(T0 - 86_400_000),
  });
}
