import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Actor } from "@jsw-mcms/types";
import { AuthService } from "../services/auth.service";

export interface AuthState {
  actor: Actor | undefined;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string, department: "COSTING" | "PDQC", rememberMe?: boolean) => Promise<Actor>;
  logout: () => Promise<void>;
  clearError: () => void;
  setActor: (actor: Actor | undefined) => void;
}

// ── Persistent Zustand Store ──────────────────────────────────────────────────
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      actor: undefined,
      isLoading: false,
      error: null,

      setActor: (actor) => set({ actor }),

      login: async (email: string, password: string, department: "COSTING" | "PDQC", rememberMe?: boolean) => {
        set({ isLoading: true, error: null });
        try {
          const actor = await AuthService.login(email, password, department, rememberMe);
          set({ actor, isLoading: false });
          console.log("[TRACE] Login Success: Actor=", actor);
          return actor;
        } catch (err: unknown) {
          // If error has the standardized envelope, use its message
          let apiMsg: string | undefined;
          if (err && typeof err === "object" && "response" in err) {
            const resData = (err as { response?: { data?: { error?: { message?: string } } } }).response?.data;
            apiMsg = resData?.error?.message;
          }
          const errMsg = apiMsg || (err instanceof Error ? err.message : String(err)) || "Invalid email or password.";
          set({ error: errMsg, isLoading: false });
          throw new Error(errMsg, { cause: err });
        }
      },

      logout: async () => {
        console.log("[TRACE] authStore logout() triggered");
        set({ isLoading: true });
        try {
          await AuthService.logout();
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
