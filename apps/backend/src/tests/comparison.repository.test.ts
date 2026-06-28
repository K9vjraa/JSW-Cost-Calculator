import { describe, it, expect, vi, beforeEach } from "vitest";
import { ComparisonRepository } from "../repositories/comparison.repository.js";
import { prisma } from "../prisma/client.js";

vi.mock("../prisma/client.js", () => ({
  prisma: {
    comparisonSession: {
      count: vi.fn(),
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    comparisonHistory: {
      create: vi.fn(),
      findMany: vi.fn(),
    },
    comparisonResult: {
      create: vi.fn(),
    },
    $transaction: vi.fn((callback) => callback(prisma)),
  },
}));

describe("ComparisonRepository", () => {
  let repository: ComparisonRepository;

  beforeEach(() => {
    vi.clearAllMocks();
    repository = new ComparisonRepository();
  });

  it("should count sessions", async () => {
    vi.mocked(prisma.comparisonSession.count).mockResolvedValue(5);
    const count = await repository.count({});
    expect(count).toBe(5);
    expect(prisma.comparisonSession.count).toHaveBeenCalled();
  });

  it("should findMany sessions", async () => {
    vi.mocked(prisma.comparisonSession.findMany).mockResolvedValue([{ id: "1" } as any]);
    const data = await repository.findMany({});
    expect(data.length).toBe(1);
  });

  it("should findUnique session", async () => {
    vi.mocked(prisma.comparisonSession.findFirst).mockResolvedValue({ id: "1" } as any);
    const session = await repository.findUnique("1");
    expect(session?.id).toBe("1");
    expect(prisma.comparisonSession.findFirst).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: "1", deletedAt: null }
    }));
  });

  it("should create a session within a transaction", async () => {
    vi.mocked(prisma.comparisonSession.create).mockResolvedValue({ id: "session-1" } as any);
    
    const result = await repository.create({ name: "Test", items: [] }, "user-1");
    
    expect(prisma.$transaction).toHaveBeenCalled();
    expect(prisma.comparisonSession.create).toHaveBeenCalled();
    expect(prisma.comparisonHistory.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ action: "CREATED" })
    }));
    expect(result.id).toBe("session-1");
  });
});
