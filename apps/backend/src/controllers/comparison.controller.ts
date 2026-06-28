import type { Request, Response } from "express";
import { ComparisonService } from "../services/comparison.service.js";
import {
  ComparisonPaginationSchema,
  CreateComparisonSchema,
  UpdateComparisonSchema,
  ComparisonExportSchema,
  ComparisonShareSchema,
  ComparisonPreferenceSchema,
} from "../validations/comparison.validator.js";
import { ok, paginated, buildPagination, created } from "../utils/response.js";
import { z } from "zod";

export class ComparisonController {
  static async getComparisons(req: Request, res: Response) {
    const params = ComparisonPaginationSchema.parse(req.query);
    const { total, data } = await ComparisonService.findMany(params);
    paginated(res, data, buildPagination(params.page, params.limit, total));
  }

  static async createComparison(req: Request, res: Response) {
    const data = CreateComparisonSchema.parse(req.body);
    const session = await ComparisonService.create(data, req.actor!.id);
    created(res, session);
  }

  static async updateComparison(req: Request, res: Response) {
    const id = z.string().uuid().parse(req.params.id);
    const data = UpdateComparisonSchema.parse(req.body);
    const session = await ComparisonService.update(id, data, req.actor!.id);
    ok(res, session);
  }

  static async deleteComparison(req: Request, res: Response) {
    const id = z.string().uuid().parse(req.params.id);
    await ComparisonService.delete(id, req.actor!.id);
    ok(res, { message: "Comparison session deleted" });
  }

  static async getResults(req: Request, res: Response) {
    const id = z.string().uuid().parse(req.params.id);
    const results = await ComparisonService.getEngineResults(id);
    ok(res, results);
  }

  static async getHistory(req: Request, res: Response) {
    const id = z.string().uuid().parse(req.params.id);
    const history = await ComparisonService.getHistory(id);
    ok(res, history);
  }

  static async exportComparison(req: Request, res: Response) {
    const id = z.string().uuid().parse(req.params.id);
    const { format } = ComparisonExportSchema.parse(req.body);
    // Mocking export for now; normally would generate a PDF or Excel and upload to S3 or send stream
    ok(res, {
      url: `https://api.jswmcms.internal/exports/comparisons/${id}.${format.toLowerCase()}`,
      format,
    });
  }

  static async shareComparison(req: Request, res: Response) {
    const id = z.string().uuid().parse(req.params.id);
    const { expiresInDays } = ComparisonShareSchema.parse(req.body);
    // Mocking share link generation
    ok(res, {
      shareUrl: `https://mcms.jsw.in/compare/shared/${id}?expires=${expiresInDays}`,
    });
  }

  static async getPreferences(req: Request, res: Response) {
    const prefs = await ComparisonService.getPreferences(req.actor!.id);
    ok(res, prefs);
  }

  static async updatePreferences(req: Request, res: Response) {
    const data = ComparisonPreferenceSchema.parse(req.body);
    const prefs = await ComparisonService.updatePreferences(req.actor!.id, data);
    ok(res, prefs);
  }
}
