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
      logLevel: "info",
      supabaseUrl: "http://localhost:54321",
      supabaseAnonKey: "test-anon-key"
    }
  };
});

import { createServer } from "../src/app.js";
import { prisma } from "../src/prisma/client.js";
import { generateTestToken } from "./helpers/auth.js";

vi.mock("../src/prisma/client.js", () => {
  return {
    prisma: {
      user: {
        findUnique: vi.fn().mockResolvedValue({ isActive: true, status: 'ACTIVE' })
      },
      $transaction: vi.fn(),
      grade: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        count: vi.fn(),
        create: vi.fn(),
        update: vi.fn()
      },
      gradeValidationLog: { create: vi.fn() },
      gradeVersion: { create: vi.fn() },
      gradeHistory: { create: vi.fn() },
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
    vi.mocked(prisma.$transaction).mockImplementation((cb: any) => cb(prisma));
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

    expect(res.status).toBe(403); // Rejects non-COSTING department via RBAC
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
  it("PUT /grades/:id - enforces optimistic concurrency", async () => {
    const token = generateTestToken({ role: "COSTING_DEPARTMENT" });
    
    const prismaError: any = new Error("Record to update not found.");
    prismaError.code = "P2025";
    
    vi.mocked(prisma.grade.update).mockRejectedValueOnce(prismaError);

    const res = await request(app)
      .put("/api/grades/g1")
      .set("Authorization", `Bearer ${token}`)
      .send({ version: 2, name: "Updated Name" });

    expect(res.status).toBe(409);
    expect(res.body.message).toContain("Optimistic concurrency failure");
  });

  it("POST /grades/:id/validate - validates composition perfectly at 100%", async () => {
    const token = generateTestToken({ role: "COSTING_DEPARTMENT" });
    const mockGrade = {
      id: "g1", status: "DRAFT", targetBatchQty: 100,
      gradeMaterials: [
        { materialId: "m1", compositionPercent: 60, material: { name: "M1", status: "ACTIVE", isAvail: true, currentRate: 100 } },
        { materialId: "m2", compositionPercent: 40, material: { name: "M2", status: "ACTIVE", isAvail: true, currentRate: 100 } }
      ]
    };
    
    vi.mocked(prisma.grade.findUnique).mockResolvedValue(mockGrade as any);
    vi.mocked(prisma.gradeValidationLog.create).mockResolvedValue({ id: "v1" } as any);

    const res = await request(app)
      .post("/api/grades/g1/validate")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.isValid).toBe(true);
    expect(res.body.data.errors).toHaveLength(0);
  });

  it("POST /grades/:id/validate - fails validation if composition is not 100%", async () => {
    const token = generateTestToken({ role: "COSTING_DEPARTMENT" });
    const mockGrade = {
      id: "g1", status: "DRAFT", targetBatchQty: 100,
      gradeMaterials: [
        { materialId: "m1", compositionPercent: 60, material: { name: "M1", status: "ACTIVE", isAvail: true, currentRate: 100 } },
        { materialId: "m2", compositionPercent: 30, material: { name: "M2", status: "ACTIVE", isAvail: true, currentRate: 100 } }
      ]
    };
    
    vi.mocked(prisma.grade.findUnique).mockResolvedValue(mockGrade as any);
    vi.mocked(prisma.gradeValidationLog.create).mockResolvedValue({ id: "v1" } as any);

    const res = await request(app)
      .post("/api/grades/g1/validate")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.isValid).toBe(false);
    expect(res.body.data.errors).toHaveLength(1);
    expect(res.body.data.errors[0]).toContain("100%");
  });

  it("POST /grades/:id/submit - submits successfully if valid", async () => {
    const token = generateTestToken({ role: "PDQC" });
    const mockGrade = {
      id: "g1", status: "DRAFT", targetBatchQty: 100,
      gradeMaterials: [
        { materialId: "m1", compositionPercent: 100, material: { name: "M1", status: "ACTIVE", isAvail: true, currentRate: 100 } }
      ]
    };
    
    vi.mocked(prisma.grade.findUnique).mockResolvedValue(mockGrade as any);
    vi.mocked(prisma.gradeValidationLog.create).mockResolvedValue({ id: "v1" } as any);
    vi.mocked(prisma.grade.update).mockResolvedValueOnce({ ...mockGrade, status: "SUBMITTED" } as any);

    const res = await request(app)
      .post("/api/grades/g1/submit")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe("SUBMITTED");
  });

  it("POST /grades/:id/publish - successfully publishes grade using transaction", async () => {
    const token = generateTestToken({ role: "COSTING_DEPARTMENT" });
    const mockGrade = {
      id: "g1", status: "SUBMITTED", targetBatchQty: 100,
      gradeMaterials: [
        { materialId: "m1", compositionPercent: 100, material: { name: "M1", status: "ACTIVE", isAvail: true, currentRate: 100 } }
      ]
    };
    
    vi.mocked(prisma.grade.findUnique).mockResolvedValue(mockGrade as any);
    vi.mocked(prisma.gradeValidationLog.create).mockResolvedValue({ id: "v1" } as any);
    
    // Mock the transaction returning the updated grade
    vi.mocked(prisma.$transaction).mockResolvedValueOnce({ ...mockGrade, status: "ACTIVE" } as any);

    const res = await request(app)
      .post("/api/grades/g1/publish")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe("ACTIVE");
  });
});
