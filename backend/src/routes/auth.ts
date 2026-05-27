import { Router, type Response } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { env } from "../config/env.js";
import { asyncRoute, ApiError } from "../utils/http.js";
import { prisma } from "../prisma/client.js";
import { audit } from "../services/audit.js";
import { authenticate, signAccessToken, signRefreshToken, tokenHash, verifyRefreshToken } from "../middleware/auth.js";

const loginSchema = z.object({ email: z.string().email(), password: z.string().min(8) });
const refreshCookie = "mcms_refresh";

function setRefreshCookie(res: Response, token: string) {
  res.cookie(refreshCookie, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: env.nodeEnv === "production",
    path: "/api/auth",
    maxAge: env.refreshTokenTtlDays * 24 * 60 * 60 * 1000
  });
}

async function issueSession(user: { id: string; email: string; name: string; role: { name: string } }, res: Response) {
  const accessToken = signAccessToken({ sub: user.id, email: user.email, name: user.name, role: user.role.name });
  const refreshToken = signRefreshToken(user.id);
  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      tokenHash: tokenHash(refreshToken),
      expiresAt: new Date(Date.now() + env.refreshTokenTtlDays * 24 * 60 * 60 * 1000)
    }
  });
  setRefreshCookie(res, refreshToken);
  return { accessToken, user: { id: user.id, email: user.email, name: user.name, role: user.role.name } };
}

export const authRoutes = Router();

authRoutes.post(
  "/login",
  asyncRoute(async (req, res) => {
    const input = loginSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email: input.email.toLowerCase() }, include: { role: true } });
    if (!user || user.status !== "ACTIVE") {
      await audit({ action: "LOGIN_FAILED", entity: "Authentication", details: { email: input.email, reason: "unknown-user" }, ipAddress: req.ip });
      throw new ApiError(401, "Email or password is incorrect.");
    }
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      throw new ApiError(423, "Account is temporarily locked after failed logins.");
    }
    const valid = await bcrypt.compare(input.password, user.passwordHash);
    if (!valid) {
      const failedLoginCount = user.failedLoginCount + 1;
      await prisma.user.update({
        where: { id: user.id },
        data: { failedLoginCount, lockedUntil: failedLoginCount >= 5 ? new Date(Date.now() + 15 * 60 * 1000) : null }
      });
      await audit({ userId: user.id, action: "LOGIN_FAILED", entity: "Authentication", details: { reason: "bad-password" }, ipAddress: req.ip });
      throw new ApiError(401, "Email or password is incorrect.");
    }
    await prisma.user.update({ where: { id: user.id }, data: { failedLoginCount: 0, lockedUntil: null, lastLoginAt: new Date() } });
    await audit({ userId: user.id, action: "LOGIN", entity: "Authentication", details: { role: user.role.name }, ipAddress: req.ip });
    res.json(await issueSession(user, res));
  })
);

authRoutes.post(
  "/refresh",
  asyncRoute(async (req, res) => {
    const token = req.cookies[refreshCookie] as string | undefined;
    if (!token) throw new ApiError(401, "Refresh session missing.");
    const claims = verifyRefreshToken(token);
    const existing = await prisma.refreshToken.findUnique({ where: { tokenHash: tokenHash(token) }, include: { user: { include: { role: true } } } });
    if (!existing || existing.revokedAt || existing.expiresAt < new Date() || existing.userId !== claims.sub) {
      throw new ApiError(401, "Refresh session is no longer valid.");
    }
    const replacement = signRefreshToken(existing.userId);
    await prisma.$transaction([
      prisma.refreshToken.update({ where: { id: existing.id }, data: { revokedAt: new Date(), replacedByHash: tokenHash(replacement) } }),
      prisma.refreshToken.create({
        data: { userId: existing.userId, tokenHash: tokenHash(replacement), expiresAt: new Date(Date.now() + env.refreshTokenTtlDays * 24 * 60 * 60 * 1000) }
      })
    ]);
    setRefreshCookie(res, replacement);
    res.json({
      accessToken: signAccessToken({ sub: existing.user.id, email: existing.user.email, name: existing.user.name, role: existing.user.role.name }),
      user: { id: existing.user.id, email: existing.user.email, name: existing.user.name, role: existing.user.role.name }
    });
  })
);

authRoutes.post(
  "/logout",
  asyncRoute(async (req, res) => {
    const token = req.cookies[refreshCookie] as string | undefined;
    if (token) {
      await prisma.refreshToken.updateMany({ where: { tokenHash: tokenHash(token), revokedAt: null }, data: { revokedAt: new Date() } });
    }
    res.clearCookie(refreshCookie, { path: "/api/auth" });
    res.status(204).send();
  })
);

authRoutes.get(
  "/me",
  authenticate,
  asyncRoute(async (req, res) => {
    const user = await prisma.user.findUnique({ where: { id: req.actor!.id }, include: { role: true } });
    if (!user) throw new ApiError(404, "User not found.");
    res.json({ id: user.id, name: user.name, email: user.email, role: user.role.name, department: user.department });
  })
);
