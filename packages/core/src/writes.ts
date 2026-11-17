// Ortak yazma yardımcıları: sistem mesajı ve bildirim. Her ikisi de ilgili kanalı commit sonrası yayına ekler.
// questions/answers/notifications use-case'leri de bunları kullanır (tek yerden yazılsın).
import { channel, type Id, type NotificationKind, type SystemMessageKind } from "@lokale/contracts";
import { notifications, systemMessages } from "@lokale/db";
import { newId } from "./ids";
import type { Tx } from "./tx";

export async function addSystemMessage(tx: Tx, questionId: Id, kind: SystemMessageKind, text: string): Promise<void> {
  await tx.db.insert(systemMessages).values({ id: newId(), questionId, kind, text, createdAt: new Date(tx.now) });
  tx.publish(channel.question(questionId));
}

export async function notify(
  tx: Tx,
  n: { userId: Id; kind: NotificationKind; questionId: Id; text: string; actorId: Id | null },
): Promise<void> {
  await tx.db.insert(notifications).values({ id: newId(), ...n, read: false, createdAt: new Date(tx.now) });
  tx.publish(channel.notifications(n.userId));
}
