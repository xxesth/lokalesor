// TanStack Query anahtarlarının hepsi burada (conventions.md).
import type { CityId, Id, PopularQuery } from "@lokale/contracts";

export const qk = {
  all: ["lokale"] as const,
  session: () => [...qk.all, "session"] as const,
  demoUsers: () => [...qk.all, "demo-users"] as const,
  popular: (q: PopularQuery) => [...qk.all, "popular", q] as const,
  similar: (city: CityId, text: string) => [...qk.all, "similar", city, text] as const,
  availableLocals: (city: CityId) => [...qk.all, "available-locals", city] as const,
  myQuestions: () => [...qk.all, "my-questions"] as const,
  thread: (id: Id) => [...qk.all, "thread", id] as const,
  inbox: () => [...qk.all, "inbox"] as const,
  myArchive: () => [...qk.all, "my-archive"] as const,
  openPool: () => [...qk.all, "open-pool"] as const,
  blocked: () => [...qk.all, "blocked"] as const,
  profile: (id: Id) => [...qk.all, "profile", id] as const,
  notifications: () => [...qk.all, "notifications"] as const,
  debug: () => [...qk.all, "debug"] as const,
};
