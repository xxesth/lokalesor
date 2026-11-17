// Realtime sinyali: Redis kanalı `evt:{channel}`, gövde ChannelEvent (veri taşımaz, ADR-019).
import { redisChannel, type Channel, type ChannelEvent } from "@lokale/contracts";
import type { Redis } from "ioredis";

export async function publish(redis: Redis, channels: Channel[], at: number): Promise<void> {
  if (!channels.length) return;
  const p = redis.pipeline();
  for (const channel of channels) {
    const e: ChannelEvent = { channel, type: "changed", at };
    p.publish(redisChannel(channel), JSON.stringify(e));
  }
  await p.exec();
}
