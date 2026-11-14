// Mock "veritabanı": bellek + localStorage. Sekmeler arası yazma Web Locks ile sıraya konur.
// Diğer sekmeler değişikliği localStorage'ın `storage` olayıyla öğrenir: olay yeni durumu
// (newValue) içinde taşır, böylece "sinyal veriden önce geldi" yarışı olmaz (ADR-003).
// Not: BroadcastChannel kullanılmıyor; ayrı pencerelerde localStorage gecikmeli senkronlandığı
// için sinyal gelip eski veri okunabiliyordu.
import type {
  Answer,
  Assignment,
  Channel,
  ChannelEvent,
  Notification,
  Question,
  Rating,
  Report,
  SystemMessage,
  User,
} from "@lokale/contracts";
import { DEMO_CONFIG } from "@lokale/domain";
import { buildSeed } from "./seed";

export interface MockState {
  users: User[];
  questions: Question[];
  assignments: Assignment[];
  answers: Answer[];
  ratings: Rating[];
  messages: SystemMessage[];
  notifications: Notification[];
  reports: Report[];
  /** arşiv kartındaki "faydalı" sayısına eklenen okuyucu oyları (Local Score'a girmez) */
  usefulBoost: Record<string, number>;
  /** dev panel: "zamanı ileri sar" */
  offsetMs: number;
  reassignAfterMinutes: number;
  seq: number;
  /** her yazmada +1: sekmeler en güncel durumu tanır */
  rev: number;
  /** son yazmanın etkilediği kanallar (storage olayıyla diğer sekmelere gider) */
  lastChannels: Channel[];
}

const KEY = "lokale:mock:v1";
const LOCK = "lokale:mock:db";

type Listener = (e: ChannelEvent) => void;

class MockStore {
  private state: MockState | null = null;
  private listeners = new Map<Channel, Set<Listener>>();
  private anyListeners = new Set<() => void>();
  /** bu sekmenin gördüğü en yeni sürüm (kendi yazması ya da storage olayı) */
  private knownRev = 0;

  constructor() {
    if (typeof window !== "undefined") {
      window.addEventListener("storage", (e) => {
        if (e.key !== KEY || !e.newValue) return;
        try {
          const next = JSON.parse(e.newValue) as MockState;
          if (next.rev < this.knownRev) return; // eski sürüm
          this.knownRev = next.rev;
          this.state = next;
          this.emit(next.lastChannels ?? ["*" as Channel]);
        } catch {
          this.state = null;
        }
      });
    }
  }

  now(): number {
    return Date.now() + this.read().offsetMs;
  }

  read(): MockState {
    if (this.state) return this.state;
    const raw = safeGet(KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as MockState;
        // Eski sürümden kalan veri (rev alanı yok) → yeni şemayla başla
        if (typeof parsed.rev === "number") {
          this.state = parsed;
          this.knownRev = Math.max(this.knownRev, parsed.rev);
          return this.state;
        }
      } catch {
        // bozuk veri → sıfırla
      }
    }
    this.state = fresh();
    safeSet(KEY, JSON.stringify(this.state));
    return this.state;
  }

  /**
   * Tek yazma yolu. Kilit altında en güncel durumu okur, fn'i uygular, kaydeder ve
   * etkilenen kanalları hem bu sekmede hem diğer sekmelerde yayınlar (commit sonrası yayın).
   */
  async transact<T>(fn: (s: MockState, now: number, touch: (c: Channel) => void) => T): Promise<T> {
    const run = async () => {
      // Kilit alındı; diğer sekmenin son yazması localStorage'a henüz yansımadıysa kısa bekle
      // (kayıp güncellemeyi önler).
      let s = this.reread();
      for (let i = 0; i < 20 && s.rev < this.knownRev; i++) {
        await new Promise((r) => setTimeout(r, 15));
        s = this.reread();
      }
      const touched = new Set<Channel>();
      const result = fn(s, Date.now() + s.offsetMs, (c) => touched.add(c));
      const channels = [...touched];
      s.rev += 1;
      s.lastChannels = channels;
      this.knownRev = s.rev;
      this.state = s;
      safeSet(KEY, JSON.stringify(s));
      this.emit(channels);
      return result;
    };
    if (typeof navigator !== "undefined" && navigator.locks) {
      return navigator.locks.request(LOCK, run);
    }
    return run();
  }

  nextId(s: MockState, prefix: string): string {
    s.seq += 1;
    return `${prefix}_${s.seq.toString(36)}${Math.random().toString(36).slice(2, 6)}`;
  }

  subscribe(channel: Channel, cb: Listener): () => void {
    let set = this.listeners.get(channel);
    if (!set) this.listeners.set(channel, (set = new Set()));
    set.add(cb);
    return () => set.delete(cb);
  }

  /** Tüm veri sıfırlandı (dev panel "sıfırla"). */
  onAnyChange(cb: () => void): () => void {
    this.anyListeners.add(cb);
    return () => this.anyListeners.delete(cb);
  }

  /** Demo verisini başa al. "*" tüm ekranları ve diğer sekmeleri yeniler. */
  reset(): Promise<void> {
    return this.transact((s, _now, touch) => {
      const rev = s.rev;
      Object.assign(s, fresh());
      s.rev = rev;
      touch("*" as Channel);
    });
  }

  private reread(): MockState {
    this.state = null;
    return this.read();
  }

  private emit(channels: Channel[]) {
    const at = Date.now();
    const all = channels.includes("*" as Channel);
    for (const [ch, set] of this.listeners) {
      if (all || channels.includes(ch)) for (const cb of set) cb({ channel: ch, type: "changed", at });
    }
    if (all) for (const cb of this.anyListeners) cb();
  }
}

function fresh(): MockState {
  const now = Date.now();
  return {
    ...buildSeed(now),
    offsetMs: 0,
    reassignAfterMinutes: DEMO_CONFIG.reassignAfterMinutes,
    seq: 0,
    rev: 0,
    lastChannels: [],
  };
}

function safeGet(key: string): string | null {
  try {
    return typeof localStorage === "undefined" ? null : localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSet(key: string, value: string) {
  try {
    if (typeof localStorage !== "undefined") localStorage.setItem(key, value);
  } catch {
    // depolama dolu/kapalı: bellek içi devam
  }
}

let store: MockStore | null = null;
export function getStore(): MockStore {
  if (!store) store = new MockStore();
  return store;
}
export type { MockStore };
