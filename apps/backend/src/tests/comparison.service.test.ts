import { describe, it, expect, vi, beforeEach } from "vitest";
import { ComparisonService } from "../services/comparison.service.js";
import { ComparisonRepository } from "../repositories/comparison.repository.js";
import { ComparisonCache } from "../cache/comparison.cache.js";
import { ComparisonEngine } from "../services/ComparisonEngine.service.js";
import { ApiError } from "../utils/http.js";

vi.mock("../repositories/comparison.repository.js");
vi.mock("../cache/comparison.cache.js");
vi.mock("../services/ComparisonEngine.service.js");

describe("ComparisonService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should findUniqueOrThrow when session exists", async () => {
    const mockSession = { id: "1", name: "Test" };
    vi.mocked(ComparisonRepository.prototype.findUnique).mockResolvedValue(mockSession as any);

    const result = await ComparisonService.findUniqueOrThrow("1");
    expect(result).toEqual(mockSession);
  });

  it("should throw ApiError when session not found", async () => {
    vi.mocked(ComparisonRepository.prototype.findUnique).mockResolvedValue(null);

    await expect(ComparisonService.findUniqueOrThrow("999")).rejects.toThrow(ApiError);
  });

  it("should getEngineResults from cache if available", async () => {
    const mockCacheData = { referenceGradeId: "ref-1", grades: [], recommendations: [], calculatedAt: "" };
    vi.mocked(ComparisonCache.get).mockResolvedValue(mockCacheData);

    const result = await ComparisonService.getEngineResults("1");
    expect(result).toEqual(mockCacheData);
    expect(ComparisonRepository.prototype.findUnique).not.toHaveBeenCalled();
  });

  it("should calculate engine results and save to cache if miss", async () => {
    vi.mocked(ComparisonCache.get).mockResolvedValue(null);
    vi.mocked(ComparisonRepository.prototype.findUnique).mockResolvedValue({ id: "1", items: [] } as any);
    const mockCalcData = { referenceGradeId: "ref-1", grades: [], recommendations: [], calculatedAt: "" };
    vi.mocked(ComparisonEngine.calculate).mockReturnValue(mockCalcData as any);

    const result = await ComparisonService.getEngineResults("1");

    expect(ComparisonEngine.calculate).toHaveBeenCalled();
    expect(ComparisonRepository.prototype.createResult).toHaveBeenCalled();
    expect(ComparisonCache.set).toHaveBeenCalledWith("comparison_result_1", mockCalcData, 300);
    expect(result).toEqual(mockCalcData);
  });
});
