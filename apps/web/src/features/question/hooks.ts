"use client";
import { channel, type Id } from "@lokale/contracts";
import { useQuery } from "@tanstack/react-query";
import { getRepository } from "@/data";
import { qk } from "@/data/query-keys";
import { useChannel } from "@/data/use-channel";

/** Soru detay: question:{id} kanalını dinler, sayfa yenilenmeden güncellenir. */
export function useQuestionThread(id: Id) {
  useChannel(channel.question(id), [qk.thread(id)]);
  return useQuery({ queryKey: qk.thread(id), queryFn: () => getRepository().getQuestionThread(id) });
}

export function useMyQuestions() {
  return useQuery({ queryKey: qk.myQuestions(), queryFn: () => getRepository().listMyQuestions() });
}
