import crypto from "node:crypto";
import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { ApiError } from "../utils/http.js";

type AccessClaims = { sub: string; email: string; name: string; role: string };

export function signAccessToken(actor: AccessClaims) {
  return jwt.sign(actor, env.accessSecret, { expiresIn: env.accessTokenTtl as jwt.SignOptions["expiresIn"] });
}

export function signRefreshToken(userId: string) {
  return jwt.sign({ sub: userId, jti: crypto.randomUUID() }, env.refreshSecret, { expiresIn: `${env.refreshTokenTtlDays}d` });
}

export function tokenHash(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function verifyRefreshToken(token: string) {
  return jwt.verify(token, env.refreshSecret) as { sub: string; jti: string };
}

export function authenticate(req: Request, _res: Response, next: NextFunction) {
  const header = req.header("authorization");
  const token = header?.startsWith("Bearer ") ? header.slice(7) : undefined;
  if (!token) {
    next(new ApiError(401, "Authentication required."));
    return;
  }
  try {
    const claims = jwt.verify(token, env.accessSecret) as AccessClaims;
    req.actor = { id: claims.sub, email: claims.email, name: claims.name, role: claims.role };
    next();
  } catch {
    next(new ApiError(401, "Access token expired or invalid."));
  }
}

export function allowRoles(...roles: string[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.actor || !roles.includes(req.actor.role)) {
      next(new ApiError(403, "This role cannot access the requested resource."));
      return;
    }
    next();
  };
}
