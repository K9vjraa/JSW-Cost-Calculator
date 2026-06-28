import { z } from "zod";

export const ComparisonPaginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  sortBy: z.enum(["createdAt", "updatedAt", "name", "status"]).default("createdAt"),
  sortDesc: z.coerce.boolean().default(true),
  status: z.enum(["ACTIVE", "ARCHIVED"]).optional(),
  search: z.string().optional(),
});

export const ComparisonItemSchema = z.object({
  gradeId: z.string().uuid(),
  position: z.number().int().min(0).default(0),
  colorCode: z.string().optional(),
});

export const CreateComparisonSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().max(1000).optional(),
  items: z.array(ComparisonItemSchema).min(2).max(10),
});

export const UpdateComparisonSchema = CreateComparisonSchema.partial().extend({
  status: z.enum(["ACTIVE", "ARCHIVED"]).optional(),
});

export const ComparisonExportSchema = z.object({
  format: z.enum(["PDF", "EXCEL", "CSV"]),
});

export const ComparisonShareSchema = z.object({
  expiresInDays: z.number().int().min(1).max(30).default(7),
});

export const ComparisonPreferenceSchema = z.object({
  defaultMetrics: z.record(z.unknown()).optional(),
  viewMode: z.enum(["TABLE", "CHART"]).default("TABLE"),
  theme: z.enum(["LIGHT", "DARK"]).default("LIGHT"),
});
