import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

// ── Singleton Prisma client ───────────────────────────────────────────────────
// Prevents multiple PrismaClient instances in development (hot-reload safe)
declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

export const prisma =
  global.__prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"]
  });

if (process.env.NODE_ENV !== "production") {
  global.__prisma = prisma;
}
