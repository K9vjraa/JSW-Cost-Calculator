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

vi.mock("../src/prisma/client.js", () => {
  return {
    prisma: {
      grade: {
        findMany: vi.fn(),
        count: vi.fn(),
        create: vi.fn(),
        update: vi.fn()
      },
      auditLog: {
        create: vi.fn()
      },
      notification: {
        create: vi.fn()
      }
    }
  };
});

describe("Grades API (/api/grades)", () => {
  const app = createServer();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("GET /grades - lists all active grades", async () => {
    const token = generateTestToken({ role: "PDQC" });
    const mockGrades = [
      { id: "g1", name: "SS304_Standard", description: "Standard SS304", active: true }
    ];

    vi.mocked(prisma.grade.findMany).mockResolvedValue(mockGrades as any);
    vi.mocked(prisma.grade.count).mockResolvedValue(1);

    const res = await request(app)
      .get("/api/grades")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].name).toBe("SS304_Standard");
  });

  it("POST /grades - fails if user is not COSTING_DEPARTMENT", async () => {
    const token = generateTestToken({ role: "PDQC" });
    const res = await request(app)
      .post("/api/grades")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "SS316_Premium", description: "Premium SS316", active: true });

    expect(res.status).toBe(403);
  });

  it("POST /grades - successfully creates a grade when COSTING_DEPARTMENT", async () => {
    const token = generateTestToken({ role: "COSTING_DEPARTMENT" });
    const newGrade = { id: "g2", metalId: "11111111-2222-3333-4444-555555555555", name: "SS316_Premium", multiplier: 1.1, extraPrice: 0, description: "Premium SS316", active: true };

    vi.mocked(prisma.grade.create).mockResolvedValue(newGrade as any);

    const res = await request(app)
      .post("/api/grades")
      .set("Authorization", `Bearer ${token}`)
      .send({ metalId: "11111111-2222-3333-4444-555555555555", name: "SS316_Premium", multiplier: 1.1, extraPrice: 0, description: "Premium SS316" });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe("SS316_Premium");
  });
});
