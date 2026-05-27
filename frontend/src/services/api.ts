import axios from "axios";
import type { Actor } from "@/types";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:4000/api",
  withCredentials: true
});

let accessToken = sessionStorage.getItem("mcms-access-token");
api.interceptors.request.use((config) => {
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  return config;
});

export function setAccessToken(token?: string) {
  accessToken = token ?? null;
  if (token) sessionStorage.setItem("mcms-access-token", token);
  else sessionStorage.removeItem("mcms-access-token");
}

export async function getOrFixture<T>(url: string, fixture: T): Promise<T> {
  try {
    const { data } = await api.get(url);
    return data as T;
  } catch {
    return fixture;
  }
}

const roleFromEmail = (email: string): Actor["role"] => {
  if (email.includes("admin")) return "ADMIN";
  if (email.includes("employee")) return "EMPLOYEE";
  if (email.includes("procurement") || email.includes("finance") || email.includes("production")) return "EMPLOYEE";
  return "USER";
};

export async function login(email: string, password: string) {
  try {
    const { data } = await api.post("/auth/login", { email, password });
    setAccessToken(data.accessToken);
    return data.user as Actor;
  } catch {
    if (!import.meta.env.DEV) {
      throw new Error("Login API unavailable.");
    }
    const role = roleFromEmail(email);
    const actor = { id: `demo-${role.toLowerCase()}`, email, role, name: role === "EMPLOYEE" ? "Rahul Sharma" : `${role} User`, department: role };
    setAccessToken("demo-offline-token");
    return actor;
  }
}
