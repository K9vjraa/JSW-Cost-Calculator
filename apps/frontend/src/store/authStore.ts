import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Actor } from "@jsw-mcms/types";
import { login as apiLogin, logout as apiLogout } from "../services/api";

export interface AuthState {
  actor: Actor | undefined;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<Actor>;
  logout: () => Promise<void>;
  clearError: () => void;
}

// Helper to determine role from email in offline demo mode
const roleFromEmail = (email: string): Actor["role"] => {
  if (email.includes("admin")) return "ADMIN";
  if (email.includes("procurement") || email.includes("finance") || email.includes("production") || email.includes("employee")) return "EMPLOYEE";
  return "USER";
};

// ── Persistent Zustand Store ──────────────────────────────────────────────────
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      actor: undefined,
      isLoading: false,
      error: null,

      login: async (email: string, password: string, rememberMe?: boolean) => {
        set({ isLoading: true, error: null });
        try {
          const next = await apiLogin(email, password, rememberMe);
          set({ actor: next, isLoading: false });
          return next;
        } catch (err: unknown) {
          if (import.meta.env.DEV) {
            // Offline demo fallback inside development environment
            const role = roleFromEmail(email);
            const demoActor: Actor = {
              id: `demo-${role.toLowerCase()}`,
              email,
              role,
              name: role === "EMPLOYEE" ? "Rahul Sharma" : role === "ADMIN" ? "Admin User" : "Standard User",
              department: role
            };
            set({ actor: demoActor, isLoading: false });
            return demoActor;
          }
          const errMsg =
            (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
            (err instanceof Error ? err.message : "Invalid credentials");
          set({ error: errMsg, isLoading: false });
          throw new Error(errMsg, { cause: err });
        }
      },

      logout: async () => {
        set({ isLoading: true });
        try {
          await apiLogout();
        } finally {
          set({ actor: undefined, error: null, isLoading: false });
        }
      },

      clearError: () => set({ error: null })
    }),
    {
      name: "mcms-auth-storage",
      storage: createJSONStorage(() => localStorage), // Persist auth session in localStorage
      partialize: (state) => ({ actor: state.actor }) // only persist actor object
    }
  )
);

export default useAuthStore;
