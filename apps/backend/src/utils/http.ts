import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
  }
}

export function asyncRoute<T extends (req: Request, res: Response, next: NextFunction) => Promise<unknown>>(handler: T) {
  return (req: Request, res: Response, next: NextFunction) => {
    handler(req, res, next).catch(next);
  };
}

export function errorHandler(error: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (error instanceof ZodError) {
    res.status(400).json({ success: false, message: "Validation failed.", issues: error.issues });
    return;
  }
  if (error instanceof ApiError) {
    res.status(error.status).json({ success: false, message: error.message });
    return;
  }
  console.error(error);
  res.status(500).json({ success: false, message: error instanceof Error ? error.message : "Unexpected API error." });
}

export function pageArgs(query: Request["query"]) {
  const page = Math.max(Number(query.page ?? 1), 1);
  const limit = Math.min(Math.max(Number(query.limit ?? 10), 1), 100);
  return { page, limit, skip: (page - 1) * limit };
}
