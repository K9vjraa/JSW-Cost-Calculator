import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from "axios";
import type { Actor } from "@/types";

// ── Axios instance ────────────────────────────────────────────────────────────
export const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:4000/api",
  withCredentials: true
});

// ── Access token in-memory store ──────────────────────────────────────────────
let accessToken: string | null = sessionStorage.getItem("mcms-access-token");

export function getAccessToken() {
  return accessToken;
}

export function setAccessToken(token?: string) {
  accessToken = token ?? null;
  if (token) sessionStorage.setItem("mcms-access-token", token);
  else sessionStorage.removeItem("mcms-access-token");
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

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await api.post<{ accessToken: string; user: Actor }>("/auth/refresh");
        setAccessToken(data.accessToken);
        processQueue(null, data.accessToken);
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(originalRequest);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        setAccessToken();
        // Redirect to login if refresh fails
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// ── Auth helpers ──────────────────────────────────────────────────────────────

const roleFromEmail = (email: string): Actor["role"] => {
  if (email.includes("admin")) return "ADMIN";
  if (email.includes("procurement") || email.includes("finance") || email.includes("production") || email.includes("employee")) return "EMPLOYEE";
  return "USER";
};

export async function login(email: string, password: string, rememberMe?: boolean): Promise<Actor> {
  try {
    const { data } = await api.post<{ accessToken: string; user: Actor }>("/auth/login", { email, password, rememberMe });
    setAccessToken(data.accessToken);
    return data.user;
  } catch (err) {
    if (!import.meta.env.DEV) throw err;
    // Offline dev fallback
    const role = roleFromEmail(email);
    const actor: Actor = {
      id: `demo-${role.toLowerCase()}`,
      email,
      role,
      name: role === "EMPLOYEE" ? "Rahul Sharma" : role === "ADMIN" ? "Admin User" : "Standard User",
      department: role
    };
    setAccessToken("demo-offline-token");
    return actor;
  }
}

export async function logout(): Promise<void> {
  try {
    await api.post("/auth/logout");
  } catch {
    // Ignore logout errors — always clear local state
  } finally {
    setAccessToken();
  }
}

// ── Generic helpers ───────────────────────────────────────────────────────────

export async function getOrFixture<T>(url: string, fixture: T): Promise<T> {
  try {
    const { data } = await api.get<T>(url);
    return data;
  } catch {
    return fixture;
  }
}
