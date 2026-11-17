import { Redis } from "ioredis";

/**
 * BullMQ worker'ları `maxRetriesPerRequest: null` ister; aynı ayarla tek tip bağlantı açılır.
 * Pub/sub aboneliği (realtime) ayrı bir bağlantı ister: abone olan bağlantı başka komut çalıştıramaz.
 */
export function createRedis(url: string): Redis {
  return new Redis(url, { maxRetriesPerRequest: null, lazyConnect: false });
}
export type { Redis };
