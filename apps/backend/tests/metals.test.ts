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
      metal: {
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

describe("Metals API (/api/metals)", () => {
  const app = createServer();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("GET /metals - lists all active metals", async () => {
    const token = generateTestToken({ role: "PDQC" });
    const mockMetals = [
      { id: "m1", code: "SS304", name: "Stainless Steel 304", baseMarkup: 1.1, active: true }
    ];

    vi.mocked(prisma.metal.findMany).mockResolvedValue(mockMetals as any);
    vi.mocked(prisma.metal.count).mockResolvedValue(1);

    const res = await request(app)
      .get("/api/metals")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].code).toBe("SS304");
  });

  it("POST /metals - fails if user is not COSTING_DEPARTMENT", async () => {
    const token = generateTestToken({ role: "PDQC" });
    const res = await request(app)
      .post("/api/metals")
      .set("Authorization", `Bearer ${token}`)
      .send({ code: "SS316", name: "Stainless Steel 316", baseMarkup: 1.15 });

    expect(res.status).toBe(403);
  });

  it("POST /metals - successfully creates a metal when COSTING_DEPARTMENT", async () => {
    const token = generateTestToken({ role: "COSTING_DEPARTMENT" });
    const newMetal = { id: "m2", code: "SS316", name: "Stainless Steel 316", category: "Ferrous", baseMarkup: 1.15, active: true };

    vi.mocked(prisma.metal.create).mockResolvedValue(newMetal as any);

    const res = await request(app)
      .post("/api/metals")
      .set("Authorization", `Bearer ${token}`)
      .send({ code: "SS316", name: "Stainless Steel 316", category: "Ferrous", baseMarkup: 1.15 });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.code).toBe("SS316");
  });
});
