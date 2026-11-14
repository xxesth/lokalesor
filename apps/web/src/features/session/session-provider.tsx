"use client";
import type { CityId, Id, Role, Session } from "@lokale/contracts";
import { resolveRole } from "@lokale/domain";
import { useQueryClient } from "@tanstack/react-query";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { getAuth } from "@/data";

interface SessionValue {
  session: Session | null;
  /** oturum okunana kadar true */
  loading: boolean;
  role: Role;
  signIn: (userId: Id) => Promise<Session>;
  signOut: () => Promise<void>;
  setCity: (city: CityId) => Promise<void>;
  setRole: (role: Role) => Promise<void>;
  refresh: () => Promise<void>;
}

const Ctx = createContext<SessionValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const qc = useQueryClient();

  const refresh = useCallback(async () => {
    setSession(await getAuth().getSession());
    setLoading(false);
  }, []);

  // Oturum sekmeye özel depodan okunur (dış sistem → state).
  useEffect(() => {
    let alive = true;
    void getAuth()
      .getSession()
      .then((s) => {
        if (!alive) return;
        setSession(s);
        setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  const value = useMemo<SessionValue>(() => {
    const role: Role = session ? resolveRole(session.user, session.currentCity, session.roleOverride) : "tourist";
    return {
      session,
      loading,
      role,
      async signIn(userId) {
        const s = await getAuth().signInAsDemoUser(userId);
        qc.clear();
        setSession(s);
        return s;
      },
      async signOut() {
        await getAuth().signOut();
        qc.clear();
        setSession(null);
      },
      async setCity(city) {
        setSession(await getAuth().setCurrentCity(city));
      },
      async setRole(r) {
        setSession(await getAuth().setRoleOverride(r));
      },
      refresh,
    };
  }, [session, loading, qc, refresh]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSession(): SessionValue {
  const v = useContext(Ctx);
  if (!v) throw new Error("useSession, SessionProvider içinde kullanılmalı.");
  return v;
}

/** Oturum zorunlu ekranlar için (layout yönlendirmeyi zaten yapar). */
export function useMe() {
  const { session, role } = useSession();
  if (!session) throw new Error("Oturum yok.");
  return { user: session.user, currentCity: session.currentCity, role };
}
