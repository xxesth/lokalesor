"use client";
import type { Id } from "@lokale/contracts";
import { useQuery } from "@tanstack/react-query";
import { getRepository } from "@/data";
import { qk } from "@/data/query-keys";

export function useLocalProfile(id: Id | null) {
  return useQuery({
    queryKey: qk.profile(id ?? "-"),
    queryFn: () => getRepository().getLocalProfile(id!),
    enabled: !!id,
  });
}
