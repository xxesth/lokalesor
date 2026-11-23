"use client";
import { channel } from "@lokale/contracts";
import { useQuery } from "@tanstack/react-query";
import { getRepository } from "@/data";
import { qk } from "@/data/query-keys";
import { useChannel } from "@/data/use-channel";
import { useMe } from "@/features/session";

/** Şehrin açık havuzu; pool:{şehir} kanalıyla canlı. Havuz lokalin kendi şehrine aittir. */
export function useOpenPool() {
  const { user } = useMe();
  useChannel(channel.pool(user.homeCity), [qk.openPool()]);
  return useQuery({ queryKey: qk.openPool(), queryFn: () => getRepository().listOpenPool(), refetchInterval: 15_000 });
}
