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
        findUnique: vi.fn().mockResolvedValue({ isActive: true, status: 'ACTIVE', id: 'usr-123', email: 'test.user@jsw.in', name: 'Rahul Sharma', department: 'Procurement' }), 
        update: vi.fn(),
        create: vi.fn()
      },
      auditLog: {
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
    const token = generateTestToken({ sub: "usr-123", name: "Rahul Sharma", role: "PDQC" });
    
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: "usr-123",
      name: "Rahul Sharma",
      email: "rahul@jsw.in",
      department: "Procurement",
      role: "PDQC",
      isActive: true,
      status: "ACTIVE"
    } as any);

    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe("usr-123");
    expect(res.body.data.role).toBe("PDQC");
  });

  it("PUT /auth/profile - updates name and department successfully", async () => {
    const token = generateTestToken({ sub: "usr-123" });

    vi.mocked(prisma.user.update).mockResolvedValue({
      id: "usr-123",
      name: "Rahul Updated",
      email: "rahul@jsw.in",
      department: "Procurement New",
      role: "PDQC"
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

  describe("POST /auth/login", () => {
    it("returns 200 and access/refresh token on successful credentials", async () => {
      const passwordHash = await bcrypt.hash("MCMS@2026", 4);
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: "usr-123",
        name: "Rahul Sharma",
        email: "test.user@jsw.in",
        department: "COSTING",
        role: "COSTING_DEPARTMENT",
        passwordHash,
        status: "ACTIVE"
      } as any);

      const res = await request(app)
        .post("/api/auth/login")
        .send({
          email: "test.user@jsw.in",
          password: "MCMS@2026",
          department: "COSTING"
        });

      expect(res.status).toBe(200);
      expect(res.body.accessToken).toBeDefined();
      expect(res.body.refreshToken).toBeDefined();
      expect(res.body.user.email).toBe("test.user@jsw.in");
    });

    it("returns 401 USER_NOT_FOUND when user does not exist", async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

      const res = await request(app)
        .post("/api/auth/login")
        .send({
          email: "nonexistent@jsw.in",
          password: "MCMS@2026",
          department: "COSTING"
        });

      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe("USER_NOT_FOUND");
    });

    it("returns 401 INVALID_PASSWORD when password hash mismatch", async () => {
      const passwordHash = await bcrypt.hash("correct-password", 4);
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: "usr-123",
        email: "test.user@jsw.in",
        department: "COSTING",
        role: "COSTING_DEPARTMENT",
        passwordHash,
        status: "ACTIVE"
      } as any);

      const res = await request(app)
        .post("/api/auth/login")
        .send({
          email: "test.user@jsw.in",
          password: "wrong-password",
          department: "COSTING"
        });

      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe("INVALID_PASSWORD");
    });

    it("returns 401 UNAUTHORIZED_DEPARTMENT when department is wrong", async () => {
      const passwordHash = await bcrypt.hash("MCMS@2026", 4);
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: "usr-123",
        email: "test.user@jsw.in",
        department: "COSTING",
        role: "COSTING_DEPARTMENT",
        passwordHash,
        status: "ACTIVE"
      } as any);

      const res = await request(app)
        .post("/api/auth/login")
        .send({
          email: "test.user@jsw.in",
          password: "MCMS@2026",
          department: "PDQC"
        });

      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe("UNAUTHORIZED_DEPARTMENT");
    });

    it("returns 401 INACTIVE_ACCOUNT when account is suspended or inactive", async () => {
      const passwordHash = await bcrypt.hash("MCMS@2026", 4);
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: "usr-123",
        email: "test.user@jsw.in",
        department: "COSTING",
        role: "COSTING_DEPARTMENT",
        passwordHash,
        status: "INACTIVE"
      } as any);

      const res = await request(app)
        .post("/api/auth/login")
        .send({
          email: "test.user@jsw.in",
          password: "MCMS@2026",
          department: "COSTING"
        });

      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe("INACTIVE_ACCOUNT");
    });
  });

  describe("POST /auth/refresh", () => {
    it("returns 200 and new tokens on valid refresh token", async () => {
      const token = generateTestToken({ sub: "usr-123" }, true);
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: "usr-123",
        email: "test.user@jsw.in",
        department: "COSTING",
        role: "COSTING_DEPARTMENT",
        status: "ACTIVE"
      } as any);

      const res = await request(app)
        .post("/api/auth/refresh")
        .send({ refreshToken: token });

      expect(res.status).toBe(200);
      expect(res.body.accessToken).toBeDefined();
      expect(res.body.refreshToken).toBeDefined();
    });

    it("returns 401 when refresh token is missing", async () => {
      const res = await request(app)
        .post("/api/auth/refresh")
        .send({});

      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe("INVALID_REFRESH_TOKEN");
    });
  });

  describe("POST /auth/logout", () => {
    it("returns 204 and clears token", async () => {
      const res = await request(app)
        .post("/api/auth/logout");

      expect(res.status).toBe(204);
    });
  });
});
