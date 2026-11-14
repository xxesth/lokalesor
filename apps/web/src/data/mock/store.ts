// Mock "veritabanı": bellek + localStorage. Sekmeler arası yazma Web Locks ile sıraya konur,
// değişiklikler BroadcastChannel ile diğer sekmelere duyurulur (ADR-003).
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
import { createSync } from "./sync";

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
}

const KEY = "lokale:mock:v1";
const LOCK = "lokale:mock:db";

type Listener = (e: ChannelEvent) => void;

class MockStore {
  private state: MockState | null = null;
  private listeners = new Map<Channel, Set<Listener>>();
  private anyListeners = new Set<() => void>();
  private sync = createSync((channels) => {
    this.state = null; // başka sekme yazdı → tekrar oku
    this.emit(channels);
  });

  now(): number {
    return Date.now() + this.read().offsetMs;
  }

  read(): MockState {
    if (this.state) return this.state;
    const raw = safeGet(KEY);
    if (raw) {
      try {
        this.state = JSON.parse(raw) as MockState;
        return this.state;
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
    const run = () => {
      this.state = null;
      const s = this.read();
      const touched = new Set<Channel>();
      const result = fn(s, Date.now() + s.offsetMs, (c) => touched.add(c));
      safeSet(KEY, JSON.stringify(s));
      const channels = [...touched];
      this.emit(channels);
      this.sync.post(channels);
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

  reset(): Promise<void> {
    return this.transact((s) => {
      const f = fresh();
      Object.assign(s, f);
    }).then(() => {
      // reset tüm ekranları etkiler
      this.sync.post(["*" as Channel]);
      this.emit(["*" as Channel]);
    });
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
  return { ...buildSeed(now), offsetMs: 0, reassignAfterMinutes: DEMO_CONFIG.reassignAfterMinutes, seq: 0 };
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
