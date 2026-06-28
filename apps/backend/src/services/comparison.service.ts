import { ApiError } from "../utils/http.js";
import { ComparisonEngine } from "./ComparisonEngine.service.js";
import { ComparisonRepository } from "../repositories/comparison.repository.js";
import { ComparisonCache } from "../cache/comparison.cache.js";
import { ComparisonMapper } from "../mappers/comparison.mapper.js";

type PaginationParams = {
  page: number;
  limit: number;
  sortBy: string;
  sortDesc: boolean;
  status?: "ACTIVE" | "ARCHIVED";
  search?: string;
};

export class ComparisonService {
  private static repository = new ComparisonRepository();

  static async findMany(params: PaginationParams) {
    const { page, limit, sortBy, sortDesc, status, search } = params;
    const skip = (page - 1) * limit;

    const where: any = {
      deletedAt: null,
      ...(status && { status }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ],
      }),
    };

    const [total, data] = await Promise.all([
      this.repository.count(where),
      this.repository.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortDesc ? "desc" : "asc" },
        include: {
          items: {
            include: {
              grade: { select: { id: true, name: true, metalId: true } },
            },
            orderBy: { position: "asc" },
          },
          createdBy: { select: { id: true, name: true } },
        },
      }),
    ]);

    return { total, data: ComparisonMapper.toSessionListResponse(data) };
  }

  static async findUniqueOrThrow(id: string) {
    const session = await this.repository.findUnique(id);
    if (!session) {
      throw new ApiError(404, "Comparison session not found");
    }
    return session;
  }

  static async getEngineResults(id: string) {
    const cacheKey = `comparison_result_${id}`;
    const cached = await ComparisonCache.get(cacheKey);
    if (cached) return cached;

    const session = await this.findUniqueOrThrow(id);
    const grades = session.items.map((item: any) => item.grade);
    
    // Calculate via Engine
    const results = ComparisonEngine.calculate(grades, grades.length > 0 ? grades[0].id : null);
    
    // Abstracted DB call
    await this.repository.createResult(
      id, 
      results, 
      results.grades.length > 1 ? results.grades[1].differences.cost : 0
    );

    // Save in Cache for 5 mins
    await ComparisonCache.set(cacheKey, results, 300);

    return results;
  }

  static async create(data: any, userId: string) {
    const session = await this.repository.create(data, userId);
    return ComparisonMapper.toSessionResponse(session);
  }

  static async update(id: string, data: any, userId: string) {
    await this.findUniqueOrThrow(id); // Ensure exists
    const updated = await this.repository.update(id, data, userId);
    await ComparisonCache.delete(`comparison_result_${id}`);
    return ComparisonMapper.toSessionResponse(updated);
  }

  static async delete(id: string, userId: string) {
    await this.findUniqueOrThrow(id);
    await this.repository.delete(id, userId);
    await ComparisonCache.delete(`comparison_result_${id}`);
  }

  static async getHistory(id: string) {
    await this.findUniqueOrThrow(id);
    return await this.repository.getHistory(id);
  }

  static async getPreferences(userId: string) {
    return await this.repository.getPreferences(userId);
  }

  static async updatePreferences(userId: string, data: any) {
    return await this.repository.updatePreferences(userId, data);
  }
}
