import { z } from "zod";

export const priceUpdateSchema = z.object({
  materialId: z.string().uuid("Invalid material ID"),
  newRate: z.number().positive("New rate must be greater than 0"),
  reason: z.string().min(1, "Reason is required"),
  remarks: z.string().nullable().optional(),
  effectiveDate: z.string().datetime("Invalid effective date format")
});

export const priceHistoryQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  materialId: z.string().optional(),
  userId: z.string().optional(),
});
