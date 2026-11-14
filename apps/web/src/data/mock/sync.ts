// Sekmeler arası olay yayını. Gerçek arka uçta bunun yerini SSE alır (ADR-019).
import type { Channel } from "@lokale/contracts";

const NAME = "lokale:mock:sync";

export function createSync(onRemote: (channels: Channel[]) => void) {
  let bc: BroadcastChannel | null = null;
  if (typeof window !== "undefined" && "BroadcastChannel" in window) {
    bc = new BroadcastChannel(NAME);
    bc.onmessage = (e: MessageEvent<{ channels: Channel[] }>) => onRemote(e.data.channels);
  }
  return {
    post(channels: Channel[]) {
      bc?.postMessage({ channels });
    },
  };
}
