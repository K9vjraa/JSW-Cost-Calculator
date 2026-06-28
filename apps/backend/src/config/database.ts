import { PrismaClient } from "@prisma/client";
import { env } from "./env.js";

// Declare global type for prisma to avoid multiple instances in development
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export const prisma =
  global.prisma ??
  new PrismaClient();

if (env.nodeEnv !== "production") {
  global.prisma = prisma;
}

export default prisma;
