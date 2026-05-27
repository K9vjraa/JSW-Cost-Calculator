import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { Actor } from "@/types";
import { login as apiLogin, setAccessToken } from "@/services/api";

type AuthValue = { actor?: Actor; login: (email: string, password: string) => Promise<Actor>; logout: () => void };
const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [actor, setActor] = useState<Actor | undefined>(() => {
    const stored = localStorage.getItem("mcms-actor");
    return stored ? JSON.parse(stored) as Actor : undefined;
  });
  const value = useMemo<AuthValue>(() => ({
    actor,
    login: async (email, password) => {
      const next = await apiLogin(email, password);
      setActor(next);
      localStorage.setItem("mcms-actor", JSON.stringify(next));
      return next;
    },
    logout: () => {
      setActor(undefined);
      localStorage.removeItem("mcms-actor");
      setAccessToken();
    }
  }), [actor]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("Auth context missing.");
  return value;
}
