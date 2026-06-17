import request from "supertest";
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../src/config/env.js", () => {
  return {
    env: {
      port: 4000,
      nodeEnv: "test",
      isProduction: false,
      isDevelopment: false,
      databaseUrl: "postgresql://localhost:5432/test",
      clientOrigin: "http://localhost:5173",
      accessSecret: "test-access-secret-length-must-be-long",
      refreshSecret: "test-refresh-secret-length-must-be-long",
      accessTokenTtl: "15m",
      refreshTokenTtlDays: 7,
      logLevel: "info"
    }
  };
});

import { createServer } from "../src/app.js";
import { prisma } from "../src/prisma/client.js";
import { generateTestToken } from "./helpers/auth.js";
import bcrypt from "bcryptjs";

vi.mock("../src/prisma/client.js", () => {
  return {
    prisma: {
      user: {
        findUnique: vi.fn(),
        update: vi.fn(),
        create: vi.fn()
      },
      refreshToken: {
        findUnique: vi.fn(),
        create: vi.fn(),
        updateMany: vi.fn()
      },
      role: {
        findUnique: vi.fn(),
        findMany: vi.fn()
      },
      auditLog: {
        create: vi.fn()
      }
    }
  };
});

describe("Auth Endpoints (/api/auth)", () => {
  const app = createServer();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("GET /auth/me - rejects request when no token is provided", async () => {
    const res = await request(app).get("/api/auth/me");
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain("required");
  });

  it("GET /auth/me - returns user claims when token is valid", async () => {
    const token = generateTestToken({ sub: "usr-123", name: "Rahul Sharma", role: "EMPLOYEE" });
    
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: "usr-123",
      name: "Rahul Sharma",
      email: "rahul@jsw.in",
      department: "Procurement",
      role: { name: "EMPLOYEE" }
    } as any);

    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe("usr-123");
    expect(res.body.data.role).toBe("EMPLOYEE");
  });

  it("PUT /auth/profile - updates name and department successfully", async () => {
    const token = generateTestToken({ sub: "usr-123" });

    vi.mocked(prisma.user.update).mockResolvedValue({
      id: "usr-123",
      name: "Rahul Updated",
      email: "rahul@jsw.in",
      department: "Procurement New",
      role: { name: "EMPLOYEE" }
    } as any);

    const res = await request(app)
      .put("/api/auth/profile")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Rahul Updated", department: "Procurement New" });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe("Rahul Updated");
    expect(res.body.data.department).toBe("Procurement New");
  });
});
