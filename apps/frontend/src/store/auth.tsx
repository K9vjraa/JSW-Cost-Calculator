import { createContext, useContext, type ReactNode } from "react";
import type { AuthState } from "./authStore";
import { useAuthStore } from "./authStore";

// ── Backward-compatible context bridge ───────────────────────────────────────
const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const store = useAuthStore();
  return <AuthContext.Provider value={store}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (ctx) return ctx;
  // Fallback to Zustand state if used outside provider
  return useAuthStore.getState();
}

export { useAuthStore };
export default useAuthStore;
