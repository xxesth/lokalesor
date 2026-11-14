"use client";
// Realtime: kanal olayı gelince ilgili query'leri geçersiz kıl (veri yeniden çekilir, cache elle yamanmaz).
import type { Channel } from "@lokale/contracts";
import { useQueryClient, type QueryKey } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { getRepository } from "./index";

export function useChannel(ch: Channel | null, keys: QueryKey[]) {
  const qc = useQueryClient();
  const keysRef = useRef(keys);
  useEffect(() => {
    keysRef.current = keys;
  });
  useEffect(() => {
    if (!ch) return;
    return getRepository().subscribe(ch, () => {
      for (const k of keysRef.current) void qc.invalidateQueries({ queryKey: k });
    });
  }, [ch, qc]);
}
