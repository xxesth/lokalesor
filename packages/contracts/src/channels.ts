import type { Id, Timestamp } from "./entities";

export type Channel = `question:${Id}` | `inbox:${Id}` | `notifications:${Id}`;

export const channel = {
  question: (id: Id): Channel => `question:${id}`,
  inbox: (userId: Id): Channel => `inbox:${userId}`,
  notifications: (userId: Id): Channel => `notifications:${userId}`,
} as const;

/** Sinyal; veri taşımaz. İstemci ilgili veriyi yeniden çeker. */
export interface ChannelEvent {
  channel: Channel;
  type: "changed";
  at: Timestamp;
}

/** Redis pub/sub kanal adı (Faz 2). */
export const redisChannel = (c: Channel) => `evt:${c}`;
