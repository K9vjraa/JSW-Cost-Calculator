/**
 * JSW MCMS Unified Frontend Authentication Service
 * Acts as the single point of entry for all authentication API requests.
 */
import { api as apiClient, setAccessToken, setRefreshToken } from "./api";
import type { Actor } from "@jsw-mcms/types";

export interface LoginPayload {
  email: string;
  password: string;
  department: "COSTING" | "PDQC";
  rememberMe?: boolean;
}

export const AuthService = {
  /**
   * Log in user with corporate credentials and save tokens.
   */
  login: async (email: string, password: string, department: "COSTING" | "PDQC", rememberMe?: boolean): Promise<Actor> => {
    console.log(`[FRONTEND TRACE] AuthService.login: Initiating request for ${email}`);
    const { data } = await apiClient.post<{ accessToken: string; refreshToken: string; user: Actor }>("/auth/login", {
      email,
      password,
      department,
      rememberMe
    });
    
    setAccessToken(data.accessToken);
    setRefreshToken(data.refreshToken);
    console.log("[FRONTEND TRACE] AuthService.login: Tokens successfully saved");
    return data.user;
  },

  /**
   * Log out user and clear stored tokens.
   */
  logout: async (): Promise<void> => {
    console.log("[FRONTEND TRACE] AuthService.logout: Logging out user");
    try {
      await apiClient.post("/auth/logout");
    } catch (err) {
      console.warn("[FRONTEND TRACE] AuthService.logout: API request failed (clearing local state anyway)", err);
    } finally {
      setAccessToken();
      setRefreshToken();
    }
  },

  /**
   * Get currently logged-in user profile from active session.
   */
  getCurrentSession: async (): Promise<Actor> => {
    console.log("[FRONTEND TRACE] AuthService.getCurrentSession: Fetching profile");
    const { data } = await apiClient.get<Actor>("/auth/me");
    return data;
  }
};

export default AuthService;
