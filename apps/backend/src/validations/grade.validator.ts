import { z } from "zod";

const statusSchema = z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE");
const propertySchema = z.record(z.string(), z.string()).default({});

export const createGradeSchema = z.object({
  metalId: z.string().uuid("Invalid metal ID."),
  name: z.string().min(2, "Grade name must be at least 2 characters."),
  subGrade: z.string().optional().nullable(),
  multiplier: z.coerce.number().positive("Multiplier must be positive."),
  extraPrice: z.coerce.number().nonnegative("Extra price cannot be negative.").default(0),
  status: statusSchema,
  mechanicalProperties: propertySchema,
  toleranceProperties: propertySchema,
  bendProperties: propertySchema,
  chemicalComposition: propertySchema
});

export const createGradeMaterialSchema = z.object({
  rawMaterialId: z.string().uuid("Invalid raw material ID."),
  compositionPercentage: z.coerce.number().min(0).max(100),
  isOptional: z.boolean().default(false)
});

export const updateGradeMaterialSchema = createGradeMaterialSchema.partial();
export const updateGradeSchema = createGradeSchema.partial();

export const gradeQuerySchema = z.object({
  page: z.coerce.number().positive().default(1),
  limit: z.coerce.number().positive().max(100).default(10),
  metalId: z.string().uuid().optional(),
  status: z.string().optional(),
  search: z.string().optional(),
  sortBy: z.string().optional(),
  sortDir: z.enum(["asc", "desc"]).default("asc")
});

export type CreateGradeInput = z.infer<typeof createGradeSchema>;
export type UpdateGradeInput = z.infer<typeof updateGradeSchema>;
export type GradeQueryInput = z.infer<typeof gradeQuerySchema>;
export type CreateGradeMaterialInput = z.infer<typeof createGradeMaterialSchema>;
export type UpdateGradeMaterialInput = z.infer<typeof updateGradeMaterialSchema>;

export type CloneGradeInput = { code?: string, name?: string };
