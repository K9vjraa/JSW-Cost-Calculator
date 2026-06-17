import { PrismaClient } from "@prisma/client";
import { env } from "./env.js";

// Declare global type for prisma to avoid multiple instances in development
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export const prisma =
  global.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: env.databaseUrl,
      },
    },
    log: env.logLevel === "debug" || env.nodeEnv === "development"
      ? ["query", "info", "warn", "error"]
      : ["error"],
  });

if (env.nodeEnv !== "production") {
  global.prisma = prisma;
}

export default prisma;
