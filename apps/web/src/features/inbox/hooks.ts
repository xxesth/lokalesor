"use client";
import { channel } from "@lokale/contracts";
import { useQuery } from "@tanstack/react-query";
import { getRepository } from "@/data";
import { qk } from "@/data/query-keys";
import { useChannel } from "@/data/use-channel";
import { useMe } from "@/features/session";

/** Gelen kutusu tek çağrıda; inbox:{ben} kanalıyla canlı. */
export function useInbox() {
  const { user } = useMe();
  useChannel(channel.inbox(user.id), [qk.inbox()]);
  return useQuery({ queryKey: qk.inbox(), queryFn: () => getRepository().getInbox(), refetchInterval: 15_000 });
}
