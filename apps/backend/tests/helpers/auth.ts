import jwt from "jsonwebtoken";
import { env } from "../../src/config/env.js";

export function generateTestToken(claims = {}) {
  const defaultClaims = {
    sub: "test-user-id",
    email: "test.user@jsw.in",
    name: "Test User",
    role: "ADMIN"
  };
  return jwt.sign({ ...defaultClaims, ...claims }, env.accessSecret, { expiresIn: "1h" });
}
