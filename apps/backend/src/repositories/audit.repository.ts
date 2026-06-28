/**
 * AuditRepository — Prisma data-access for AuditLog model.
 * Supports rich filtering: text search, action, entity, userId, and date ranges.
 */

import { prisma, paginate } from "./base.repository.js";
import { tableSort } from "../utils/table.js";
import type { Prisma } from "@prisma/client";

const auditSortFields = ["action", "entity", "ipAddress", "createdAt"] as const;

export interface AuditListFilter {
  page?: number;
  limit?: number;
  search?: string;
  action?: string;
  entity?: string;
  userId?: string;
  from?: string;
  to?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortDir?: "asc" | "desc";
}

export async function createAuditLog(data: {
  userId?: string;
  action: string;
  entity: string;
  entityId?: string;
  ipAddress?: string;
  details: Record<string, unknown>;
}) {
  return prisma.auditLog.create({ data: data as any });
}

export async function listAuditLogs(filter: AuditListFilter) {
  const page = filter.page ?? 1;
  const limit = Math.min(filter.limit ?? 20, 100);
  const skip = (page - 1) * limit;
  const sort = tableSort(
    { sortBy: filter.sortBy, sortDir: filter.sortDir },
    auditSortFields,
    "createdAt",
    "desc"
  );

  const where: Prisma.AuditLogWhereInput = {};

  if (filter.action) where.action = filter.action;
  if (filter.entity) where.entity = filter.entity;
  if (filter.userId) where.userId = filter.userId;

  const fromDate = filter.from ?? filter.startDate;
  const toDate = filter.to ?? filter.endDate;
  if (fromDate || toDate) {
    where.createdAt = {
      ...(fromDate ? { gte: new Date(fromDate) } : {}),
      ...(toDate ? { lte: new Date(toDate) } : {})
    };
  }

  if (filter.search) {
    const s = filter.search.trim();
    where.OR = [
      { action: { contains: s, mode: "insensitive" } },
      { entity: { contains: s, mode: "insensitive" } },
      { entityId: { contains: s, mode: "insensitive" } },
      { ipAddress: { contains: s, mode: "insensitive" } },
      {
        user: {
          OR: [
            { name: { contains: s, mode: "insensitive" } },
            { email: { contains: s, mode: "insensitive" } }
          ]
        }
      }
    ];
  }

  const [total, data] = await paginate(
    prisma.auditLog.count({ where }),
    prisma.auditLog.findMany({
      where,
      include: {
        user: {
          select: { name: true, email: true, role: true }
        }
      },
      orderBy: sort.orderBy,
      skip,
      take: limit
    })
  );
  return { data, total, page, limit };
}
