"use client";
// Tek bir interval ile saniyelik "şimdi". Mock'ta ileri sarılmış saati de yansıtır.
import { useSyncExternalStore } from "react";
import { clock } from "./index";

let current = 0;
const subs = new Set<() => void>();
let timer: ReturnType<typeof setInterval> | null = null;

function subscribe(cb: () => void) {
  subs.add(cb);
  if (!timer) {
    current = clock.now();
    timer = setInterval(() => {
      current = clock.now();
      for (const s of subs) s();
    }, 1000);
  }
  return () => {
    subs.delete(cb);
    if (subs.size === 0 && timer) {
      clearInterval(timer);
      timer = null;
    }
  };
}

export function useNow(): number {
  return useSyncExternalStore(
    subscribe,
    () => current || (current = clock.now()),
    () => 0,
  );
}
