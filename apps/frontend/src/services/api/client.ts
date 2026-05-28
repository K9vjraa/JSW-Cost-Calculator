import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from "axios";
import type { Actor } from "@/types";

// ── Central Axios Client Instance ──────────────────────────────────────────────
export const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:4000/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  }
});

// ── In-Memory Token Store ──────────────────────────────────────────────────────
let accessToken: string | null = sessionStorage.getItem("mcms-access-token");

export function getAccessToken(): string | null {
  return accessToken;
}

export function setAccessToken(token?: string) {
  accessToken = token ?? null;
  if (token) {
    sessionStorage.setItem("mcms-access-token", token);
  } else {
    sessionStorage.removeItem("mcms-access-token");
  }
}

// ── Request Interceptor (Bearer Token Binding) ─────────────────────────────────
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// ── Response Refresh Token Queueing ───────────────────────────────────────────
let isRefreshing = false;
let pendingQueue: Array<{ resolve: (token: string) => void; reject: (err: unknown) => void }> = [];

function processQueue(error: unknown, token: string | null) {
  pendingQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token!);
  });
  pendingQueue = [];
}

// ── Response Interceptor & Error Handler ──────────────────────────────────────
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Handle 401 Unauthorized for general endpoints (excluding authentication)
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/auth/")
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          pendingQueue.push({ resolve, reject });
        }).then((newToken) => {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return apiClient(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await apiClient.post<{ accessToken: string; user: Actor }>("/auth/refresh");
        setAccessToken(data.accessToken);
        processQueue(null, data.accessToken);
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        setAccessToken();
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    // Format consistent server error message responses
    const serverMessage = error.response?.data?.message || "An unexpected MCMS API error occurred.";
    return Promise.reject(new Error(serverMessage, { cause: error }));
  }
);
