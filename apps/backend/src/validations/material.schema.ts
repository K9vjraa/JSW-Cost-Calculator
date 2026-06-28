import { z } from "zod";

export const materialQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  search: z.string().optional(),
  category: z.string().optional(),
  status: z.string().optional()
});

export const createMaterialSchema = z.object({
  material_code: z.string().min(1, "Material code is required"),
  material_name: z.string().min(1, "Material name is required"),
  description: z.string().optional(),
  category: z.string().optional(),
  uom: z.string().default("kg"),
  current_rate: z.number().optional(),
  is_micro_alloy: z.boolean().default(false)
});

export const updateMaterialSchema = z.object({
  material_name: z.string().min(1).optional(),
  description: z.string().optional(),
  category: z.string().optional(),
  uom: z.string().optional(),
  current_rate: z.number().optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
  is_micro_alloy: z.boolean().optional()
});

export const statusUpdateSchema = z.object({
  status: z.enum(["ACTIVE", "INACTIVE"])
});

export const bulkUpdateSchema = z.object({
  ids: z.array(z.string().uuid()),
  status: z.enum(["ACTIVE", "INACTIVE"])
});
