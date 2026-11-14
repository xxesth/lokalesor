"use client";
import { channel } from "@lokale/contracts";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getRepository } from "@/data";
import { qk } from "@/data/query-keys";
import { useChannel } from "@/data/use-channel";
import { useSession } from "@/features/session";

export function useNotifications() {
  const { session } = useSession();
  const me = session?.user.id ?? null;
  const qc = useQueryClient();
  // Bildirim kanalı kullanıcıyı ilgilendiren her değişikliğin sinyalidir: listeler de tazelenir.
  useChannel(me ? channel.notifications(me) : null, [qk.notifications(), qk.myQuestions(), qk.inbox()]);
  const list = useQuery({ queryKey: qk.notifications(), queryFn: () => getRepository().listNotifications(), enabled: !!me });
  const markAll = useMutation({
    mutationFn: () => getRepository().markNotificationsRead(),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.notifications() }),
  });
  const unread = list.data?.filter((n) => !n.read).length ?? 0;
  return { list, unread, markAll };
}
