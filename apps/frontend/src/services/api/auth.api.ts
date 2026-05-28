import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient, setAccessToken } from "./client";
import type { Actor } from "@/types";

export interface LoginPayload {
  email: string;
  password: string;
  rememberMe?: boolean;
}

// ── Master API Endpoints ──────────────────────────────────────────────────────
export const authApi = {
  login: async (payload: LoginPayload): Promise<Actor> => {
    const { data } = await apiClient.post<{ accessToken: string; user: Actor }>("/auth/login", payload);
    setAccessToken(data.accessToken);
    return data.user;
  },

  logout: async (): Promise<void> => {
    try {
      await apiClient.post("/auth/logout");
    } finally {
      setAccessToken();
    }
  },

  getCurrentSession: async (): Promise<Actor> => {
    const { data } = await apiClient.get<Actor>("/auth/session");
    return data;
  }
};

// ── TanStack Query Hooks ──────────────────────────────────────────────────────
export function useLoginMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (actor) => {
      // Invalidate active session and dashboard queries upon successful login
      queryClient.setQueryData(["auth-session"], actor);
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    }
  });
}

export function useLogoutMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      // Clean cache state completely upon logout
      queryClient.clear();
    }
  });
}
