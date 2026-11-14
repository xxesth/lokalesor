// Demo girişi: hazır kullanıcı seçilir, oturum sekmeye özel (sessionStorage).
// İki pencerede iki farklı kullanıcı açılabilir.
import { RepoError, type CityId, type Id, type Role, type Session, type User } from "@lokale/contracts";
import type { AuthPort } from "../repository";
import { getStore } from "./store";

const KEY = "lokale:session";

interface StoredSession {
  userId: Id;
  currentCity: CityId;
  roleOverride: Role | null;
}

/** Turistler pilot şehirde (İstanbul) başlar; lokaller kendi şehrinde. */
const DEMO_START_CITY: CityId = "istanbul";

function readStored(): StoredSession | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as StoredSession) : null;
  } catch {
    return null;
  }
}

function writeStored(s: StoredSession | null) {
  try {
    if (s) sessionStorage.setItem(KEY, JSON.stringify(s));
    else sessionStorage.removeItem(KEY);
  } catch {
    // sekme depolaması kapalı: oturum bellekte kalır
  }
}

function toSession(stored: StoredSession): Session | null {
  const user = getStore()
    .read()
    .users.find((u) => u.id === stored.userId);
  return user ? { user, currentCity: stored.currentCity, roleOverride: stored.roleOverride } : null;
}

/** mock-repository aktörü buradan alır (sunucudaki requireUser karşılığı). */
export function currentUser(): User {
  const stored = readStored();
  const session = stored ? toSession(stored) : null;
  if (!session) throw new RepoError("UNAUTHENTICATED", "Önce giriş yap.");
  return session.user;
}

const ORDER = ["elif", "zeynep", "mert", "deniz", "can"];

export const mockAuth: AuthPort = {
  async listDemoUsers() {
    const users = [...getStore().read().users];
    const rank = (u: User) => {
      const i = ORDER.indexOf(u.id);
      return i === -1 ? ORDER.length : i;
    };
    return users.sort((a, b) => rank(a) - rank(b) || a.name.localeCompare(b.name, "tr"));
  },

  async signInAsDemoUser(userId) {
    const user = getStore()
      .read()
      .users.find((u) => u.id === userId);
    if (!user) throw new RepoError("NOT_FOUND", "Kullanıcı bulunamadı.");
    const stored: StoredSession = {
      userId,
      currentCity: user.homeCity === DEMO_START_CITY ? user.homeCity : DEMO_START_CITY,
      roleOverride: null,
    };
    writeStored(stored);
    return toSession(stored)!;
  },

  async getSession() {
    const stored = readStored();
    return stored ? toSession(stored) : null;
  },

  async setCurrentCity(city) {
    const stored = readStored();
    if (!stored) throw new RepoError("UNAUTHENTICATED");
    // Şehir değişince rol otomatik belirlensin (brief 3.4).
    const next = { ...stored, currentCity: city, roleOverride: null };
    writeStored(next);
    return toSession(next)!;
  },

  async setRoleOverride(role) {
    const stored = readStored();
    if (!stored) throw new RepoError("UNAUTHENTICATED");
    const next = { ...stored, roleOverride: role };
    writeStored(next);
    return toSession(next)!;
  },

  async signOut() {
    writeStored(null);
  },
};
