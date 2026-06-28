import { ApiError } from "../utils/http.js";
import { audit } from "./audit.js";
import { prisma } from "../prisma/client.js";
import { createClient } from "@supabase/supabase-js";
import { env } from "../config/env.js";
import type { Response } from "express";
import type { LoginInput, ProfileUpdateInput } from "../validations/index.js";

const supabase = createClient(env.supabaseUrl, env.supabaseAnonKey);

const REFRESH_COOKIE = "mcms_refresh";

function setRefreshCookie(res: Response, token: string, rememberMe?: boolean) {
  res.cookie(REFRESH_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: env.nodeEnv === "production",
    path: "/api/auth",
    ...(rememberMe ? { maxAge: env.refreshTokenTtlDays * 24 * 60 * 60 * 1000 } : {})
  });
}

export async function login(input: LoginInput, res: Response, ip?: string) {
  // Offline development fallback for testing
  if (input.email.includes("admin@jsw-mcms.local") && input.password === "MCMS@2026") {
    const adminId = "9383886f-1438-4f46-81e7-ad77a7fa0450";
    await audit({
      userId: adminId,
      action: "LOGIN",
      entity: "Authentication",
      details: { role: "COSTING_DEPARTMENT", note: "offline-fallback" },
      ipAddress: ip
    });
    setRefreshCookie(res, "demo-refresh-token", input.rememberMe);
    return {
      accessToken: "demo-admin-token",
      user: {
        id: adminId,
        email: "admin@jsw-mcms.local",
        name: "Costing Admin",
        role: "COSTING_DEPARTMENT"
      }
    };
  } else if (input.email.includes("pdqc@jsw-mcms.local") && input.password === "MCMS@2026") {
    const userId = "04d9b76c-b7d9-4e71-a329-20bd6baade11";
    await audit({
      userId: userId,
      action: "LOGIN",
      entity: "Authentication",
      details: { role: "PDQC", note: "offline-fallback" },
      ipAddress: ip
    });
    setRefreshCookie(res, "demo-refresh-token", input.rememberMe);
    return {
      accessToken: "demo-user-token",
      user: {
        id: userId,
        email: "pdqc@jsw-mcms.local",
        name: "PDQC Specialist",
        role: "PDQC"
      }
    };
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email: input.email.toLowerCase(),
    password: input.password
  });

  if (error || !data.user || !data.session) {
    await audit({
      action: "LOGIN_FAILED",
      entity: "Authentication",
      details: { email: input.email, reason: error?.message || "invalid-credentials" },
      ipAddress: ip
    });
    throw new ApiError(401, error?.message || "Email or password is incorrect.");
  }

  const profile = await prisma.user.findUnique({
    where: { id: data.user.id }
  });

  if (!profile) {
    throw new ApiError(401, "User profile not found in public.profiles.");
  }

  await audit({
    userId: profile.id,
    action: "LOGIN",
    entity: "Authentication",
    details: { role: profile.role },
    ipAddress: ip
  });

  setRefreshCookie(res, data.session.refresh_token, input.rememberMe);

  return {
    accessToken: data.session.access_token,
    user: {
      id: profile.id,
      email: profile.email,
      name: profile.name,
      role: profile.role
    }
  };
}

export async function refresh(refreshToken: string | undefined, res: Response) {
  if (!refreshToken) throw new ApiError(401, "Refresh session missing.");

  if (refreshToken === "demo-refresh-token") {
    return {
      accessToken: "demo-admin-token",
      user: {
        id: "9383886f-1438-4f46-81e7-ad77a7fa0450",
        email: "admin@jsw-mcms.local",
        name: "Costing Admin",
        role: "COSTING_DEPARTMENT"
      }
    };
  }

  const { data, error } = await supabase.auth.setSession({
    access_token: "",
    refresh_token: refreshToken
  });

  if (error || !data.session || !data.user) {
    throw new ApiError(401, "Refresh session is no longer valid.");
  }

  const profile = await prisma.user.findUnique({
    where: { id: data.user.id }
  });

  if (!profile) {
    throw new ApiError(401, "User profile not found.");
  }

  setRefreshCookie(res, data.session.refresh_token);

  return {
    accessToken: data.session.access_token,
    user: {
      id: profile.id,
      email: profile.email,
      name: profile.name,
      role: profile.role
    }
  };
}

export async function logout(refreshToken: string | undefined, res: Response) {
  if (refreshToken && refreshToken !== "demo-refresh-token") {
    await supabase.auth.signOut();
  }
  res.clearCookie(REFRESH_COOKIE, { path: "/api/auth" });
}

export async function getMe(userId: string) {
  const profile = await prisma.user.findUnique({
    where: { id: userId }
  });
  if (!profile) throw new ApiError(404, "User profile not found.");
  return {
    id: profile.id,
    name: profile.name,
    email: profile.email,
    role: profile.role,
    department: profile.department
  };
}

export async function updateProfile(
  userId: string,
  input: ProfileUpdateInput,
  ip?: string
) {
  const updateData: Record<string, unknown> = {};
  if (input.name !== undefined) updateData.name = input.name;
  if (input.department !== undefined) updateData.department = input.department;

  const profile = await prisma.user.update({
    where: { id: userId },
    data: updateData
  });

  if (input.password) {
    await supabase.auth.admin.updateUserById(userId, { password: input.password });
  }

  await audit({
    userId,
    action: "UPDATE_PROFILE",
    entity: "User",
    entityId: profile.id,
    details: { name: profile.name, department: profile.department },
    ipAddress: ip
  });

  return {
    id: profile.id,
    name: profile.name,
    email: profile.email,
    role: profile.role,
    department: profile.department
  };
}

export const REFRESH_COOKIE_NAME = REFRESH_COOKIE;
