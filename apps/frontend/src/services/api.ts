import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from "axios";
import type { Actor } from "@/types";
import { toast } from "sonner";
import { logger } from "../utils/logger";
import { useAuthStore } from "../store/authStore";

// ── Axios instance ────────────────────────────────────────────────────────────
export const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:4000/api",
  withCredentials: true
});

// ── Access token in-memory store ──────────────────────────────────────────────
let accessToken: string | null = localStorage.getItem("mcms-access-token");

export function getAccessToken() {
  return accessToken;
}

export function setAccessToken(token?: string) {
  accessToken = token ?? null;
  if (token) {
    localStorage.setItem("mcms-access-token", token);
    console.log("[TRACE] Token Saved to localStorage");
  } else {
    localStorage.removeItem("mcms-access-token");
    console.log("[TRACE] Token Removed from localStorage");
  }
}

export function getRefreshToken() {
  return localStorage.getItem("mcms-refresh-token");
}

export function setRefreshToken(token?: string) {
  if (token) localStorage.setItem("mcms-refresh-token", token);
  else localStorage.removeItem("mcms-refresh-token");
}

// ── Request interceptor: attach Bearer token ──────────────────────────────────
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// ── Response interceptor: refresh token on 401 ────────────────────────────────
let isRefreshing = false;
let pendingQueue: Array<{ resolve: (token: string) => void; reject: (err: unknown) => void }> = [];

function processQueue(error: unknown, token: string | null) {
  pendingQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token!);
  });
  pendingQueue = [];
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Only intercept 401s that are NOT from auth endpoints themselves
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/auth/")
    ) {
      if (isRefreshing) {
        // Queue the request while a refresh is in flight
        return new Promise((resolve, reject) => {
          pendingQueue.push({ resolve, reject });
        }).then((newToken) => {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        });
      }

      const rToken = getRefreshToken();
      if (!rToken) {
        console.warn("[TRACE] Refresh token missing from localStorage. Direct logout.");
        setAccessToken();
        setRefreshToken();
        useAuthStore.getState().logout();
        return Promise.reject(error);
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await api.post<{ accessToken: string; refreshToken?: string; user: Actor }>("/auth/refresh", { refreshToken: rToken });
        setAccessToken(data.accessToken);
        if (data.refreshToken) setRefreshToken(data.refreshToken);
        processQueue(null, data.accessToken);
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(originalRequest);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        setAccessToken();
        setRefreshToken();
        console.warn("[TRACE] Logout Trigger: API 401 response interceptor. Redirecting to login...");

        // Centralized auth logout flow
        useAuthStore.getState().logout();
        
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    // Logging all API errors in our global diagnostic buffer
    logger.error(`API Call failed: [${originalRequest.method?.toUpperCase()}] ${originalRequest.url}`, {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });

    // Skip error toasts for endpoints that handle their own fallbacks (e.g. dashboards)
    const skipToast = originalRequest.url?.includes("/health") || originalRequest.url?.includes("/dashboard");

    if (!skipToast) {
      if (error.response?.status === 403) {
        toast.error("Security Clearance: Your current role does not have authorization to perform this action.", { id: "erp-unauthorized-alert" });
      } else if (!error.response) {
        toast.error("ERP Network Disconnected: Unable to reach costing server. Retrying connection...", { id: "erp-connection-alert" });
      } else if (error.response?.status >= 500) {
        toast.error("ERP Internal Server Error: JSW Cost Database is temporarily busy. Attempting automatic recovery...", { id: "erp-server-alert" });
      }
    }

    return Promise.reject(error);
  }
);

// ── Generic helpers ───────────────────────────────────────────────────────────

export async function getOrFixture<T>(url: string, fixture: T): Promise<T> {
  try {
    const { data } = await api.get<T>(url);
    return data;
  } catch {
    return fixture;
  }
}
