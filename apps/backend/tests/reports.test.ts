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
      report: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        count: vi.fn(),
        create: vi.fn(),
        delete: vi.fn()
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

describe("Reports API (/api/reports)", () => {
  const app = createServer();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("GET /reports - lists all reports user is authorized to see", async () => {
    const token = generateTestToken({ sub: "usr-123", role: "PDQC" });
    const mockReports = [
      { id: "rep-1", title: "Monthly Costing", createdById: "usr-123", active: true }
    ];

    vi.mocked(prisma.report.findMany).mockResolvedValue(mockReports as any);
    vi.mocked(prisma.report.count).mockResolvedValue(1);

    const res = await request(app)
      .get("/api/reports")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].title).toBe("Monthly Costing");
  });

  it("POST /reports - creates a report for employee or admin", async () => {
    const token = generateTestToken({ sub: "usr-123", role: "PDQC" });
    const mockReport = { id: "rep-2", name: "Q3 Forecast", createdById: "usr-123", type: "trend" };

    vi.mocked(prisma.report.create).mockResolvedValue(mockReport as any);

    const res = await request(app)
      .post("/api/reports")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Q3 Forecast", type: "trend", filters: {} });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe("Q3 Forecast");
  });

  it("POST /reports - fails for external USER role", async () => {
    const token = generateTestToken({ sub: "usr-123", role: "USER" });
    const res = await request(app)
      .post("/api/reports")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Unauthorized Report", type: "trend", filters: {} });

    expect(res.status).toBe(403);
  });
});
