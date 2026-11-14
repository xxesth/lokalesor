"use client";
import { channel, type Id } from "@lokale/contracts";
import { useQuery } from "@tanstack/react-query";
import { getRepository } from "@/data";
import { qk } from "@/data/query-keys";
import { useChannel } from "@/data/use-channel";

/** Soru detay: question:{id} kanalını dinler, sayfa yenilenmeden güncellenir. */
export function useQuestionThread(id: Id) {
  useChannel(channel.question(id), [qk.thread(id)]);
  return useQuery({
    queryKey: qk.thread(id),
    queryFn: () => getRepository().getQuestionThread(id),
    // Güvenlik ağı: realtime sinyali kaçarsa soru beklerken 10 sn'de bir tazele.
    refetchInterval: (q) => (q.state.data?.currentAssignment ? 10_000 : false),
    refetchOnWindowFocus: true,
  });
}

export function useMyQuestions() {
  return useQuery({
    queryKey: qk.myQuestions(),
    queryFn: () => getRepository().listMyQuestions(),
    refetchInterval: (q) => (q.state.data?.some((s) => s.currentAssignment) ? 10_000 : false),
    refetchOnWindowFocus: true,
  });
}
