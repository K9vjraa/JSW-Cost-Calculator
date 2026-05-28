import { prisma } from "../prisma/client.js";

export async function audit(input: {
  userId?: string;
  action: string;
  entity: string;
  entityId?: string;
  ipAddress?: string;
  details: Record<string, unknown>;
}) {
  return prisma.auditLog.create({ data: input as any });
}
