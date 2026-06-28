import { z } from "zod";

const statusSchema = z.enum(["DRAFT", "SUBMITTED", "APPROVED", "ACTIVE", "INACTIVE"]).default("DRAFT");
const propertySchema = z.record(z.string(), z.string()).default({});

export const createGradeSchema = z.object({
  code: z.string().optional().nullable(),
  metalId: z.string().optional().nullable(),
  name: z.string().min(2, "Grade name must be at least 2 characters."),
  category: z.string().optional().nullable(),
  steelType: z.string().optional().nullable(),
  subGrade: z.string().optional().nullable(),
  targetBatchQty: z.coerce.number().positive("Target batch quantity must be positive.").optional(),
  description: z.string().optional().nullable(),
  multiplier: z.coerce.number().positive("Multiplier must be positive.").default(1.0).optional(),
  extraPrice: z.coerce.number().nonnegative("Extra price cannot be negative.").default(0),
  status: statusSchema,
  mechanicalProperties: propertySchema,
  toleranceProperties: propertySchema,
  bendProperties: propertySchema,
  chemicalComposition: propertySchema,
  gradeMaterials: z.array(z.object({
    materialId: z.string(),
    compositionPercent: z.coerce.number().min(0).max(100),
    sortOrder: z.coerce.number().int().default(0)
  })).optional()
});

export const updateGradeSchema = createGradeSchema.partial().extend({
  version: z.coerce.number().int().positive().optional()
});

export const createGradeMaterialSchema = z.object({
  materialId: z.string(),
  compositionPercent: z.coerce.number().min(0).max(100, "Composition percent must be between 0 and 100."),
  autoQuantity: z.coerce.number().nonnegative("Auto quantity cannot be negative.").optional(),
  sortOrder: z.coerce.number().int().default(0)
});

export const updateGradeMaterialSchema = createGradeMaterialSchema.partial();

export type CreateGradeInput = z.infer<typeof createGradeSchema>;
export type UpdateGradeInput = z.infer<typeof updateGradeSchema>;
export type CreateGradeMaterialInput = z.infer<typeof createGradeMaterialSchema>;
export type UpdateGradeMaterialInput = z.infer<typeof updateGradeMaterialSchema>;
