import { z } from "zod";

export const createUserSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Must be a valid email address."),
  department: z.string().optional(),
  role: z.enum(["COSTING_DEPARTMENT", "PDQC"])
});

export const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  department: z.string().optional(),
  role: z.enum(["COSTING_DEPARTMENT", "PDQC"]).optional()
});

export const userQuerySchema = z.object({
  page: z.coerce.number().positive().default(1),
  limit: z.coerce.number().positive().max(100).default(10),
  search: z.string().optional(),
  status: z.string().optional(),
  sortBy: z.string().optional(),
  sortDir: z.enum(["asc", "desc"]).default("desc")
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type UserQueryInput = z.infer<typeof userQuerySchema>;
