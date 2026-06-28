import jwt from "jsonwebtoken";
import { env } from "../../src/config/env.js";

export function generateTestToken(claims: any = {}, isRefresh = false) {
  const role = claims.role || "ADMIN";
  const defaultDepartment = role === "COSTING_DEPARTMENT" || role === "ADMIN" ? "COSTING" : "PDQC";
  
  const defaultClaims = {
    sub: "11111111-2222-3333-4444-555555555555",
    email: "test.user@jsw.in",
    name: "Test User",
    role: role,
    department: claims.department || defaultDepartment
  };
  const secret = isRefresh ? env.refreshSecret : env.accessSecret;
  return jwt.sign({ ...defaultClaims, ...claims }, secret, { expiresIn: "1h" });
}
