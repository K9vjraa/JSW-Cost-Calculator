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

export function errorHandler(error: unknown, req: Request, res: Response, _next: NextFunction) {
  if (error instanceof ZodError) {
    res.status(400).json({ success: false, message: "Validation failed.", issues: error.issues });
    return;
  }
  if (error instanceof ApiError) {
    res.status(error.status).json({ success: false, message: error.message });
    return;
  }

  // --- ENHANCED LOGGING ---
  const errorName = error instanceof Error ? error.name : "UnknownError";
  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorStack = error instanceof Error ? error.stack : "No stack trace available";
  
  console.error("========================================");
  console.error("❌ API ERROR REPORT");
  console.error("========================================");
  console.error(`Request URL       : ${req.method} ${req.originalUrl}`);
  console.error(`Request Parameters: ${JSON.stringify(req.params)}`);
  console.error(`Query String      : ${JSON.stringify(req.query)}`);
  console.error(`Authenticated User: ${req.actor ? JSON.stringify({ id: req.actor.id, email: req.actor.email, role: req.actor.role }) : "Unauthenticated"}`);
  
  if (errorName.includes("Prisma")) {
    console.error(`Prisma Error Type : ${errorName}`);
    console.error(`Prisma Code       : ${(error as any).code || "N/A"}`);
    console.error(`Prisma Meta       : ${JSON.stringify((error as any).meta || {})}`);
    // Note: Prisma does not expose the raw SQL query in the error object by default.
  }
  
  console.error(`Error Message     : ${errorMessage}`);
  console.error(`Stack Trace       :\n${errorStack}`);
  
  // Database connection state can't be perfectly determined without checking the pool,
  // but we flag that this might be a connection issue if it's an initialization error.
  if (errorName === "PrismaClientInitializationError") {
    console.error(`DB Connection State: FAILED (Pool connection issue)`);
  } else {
    console.error(`DB Connection State: UNKNOWN / ASSUMED ACTIVE`);
  }
  console.error("========================================");

  res.status(500).json({ success: false, message: errorMessage });
}

export function pageArgs(query: Request["query"]) {
  const page = Math.max(Number(query.page ?? 1), 1);
  const limit = Math.min(Math.max(Number(query.limit ?? 10), 1), 100);
  return { page, limit, skip: (page - 1) * limit };
}
