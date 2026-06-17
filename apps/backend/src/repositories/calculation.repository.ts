/**
 * CalculationRepository — Prisma data-access for Calculation and CalculationItem.
 */

import { prisma, paginate } from "./base.repository.js";
import { tableSort } from "../utils/table.js";
import type { CalculationQueryInput } from "../validations/index.js";

const calcSortFields = [
  "batchId", "name", "mode", "status",
  "totalQuantity", "finalCost", "createdAt", "updatedAt"
] as const;

export async function listCalculations(query: CalculationQueryInput, userId: string, role: string) {
  const { page, limit } = query;
  const skip = (page - 1) * limit;
  const sort = tableSort(
    { sortBy: query.sortBy, sortDir: query.sortDir },
    calcSortFields,
    "updatedAt",
    "desc"
  );

  const baseWhere = role === "COSTING_DEPARTMENT" ? {} : { userId };

  const where = {
    ...baseWhere,
    ...(query.status ? { status: query.status as any } : {}),
    ...(query.mode ? { mode: query.mode } : {}),
    ...(query.search
      ? {
          OR: [
            { batchId: { contains: query.search, mode: "insensitive" as const } },
            { name: { contains: query.search, mode: "insensitive" as const } }
          ]
        }
      : {}),
    ...(query.from || query.to
      ? {
          createdAt: {
            ...(query.from ? { gte: new Date(query.from) } : {}),
            ...(query.to ? { lte: new Date(query.to) } : {})
          }
        }
      : {})
  };

  const [total, data] = await paginate(
    prisma.calculation.count({ where }),
    prisma.calculation.findMany({
      where,
      include: {
        user: { select: { name: true } },
        items: true,
        alloy: { select: { id: true, name: true, code: true, type: true } }
      },
      orderBy: sort.orderBy,
      skip,
      take: limit
    })
  );
  return { data, total, page, limit };
}

export async function findCalculationById(id: string) {
  return prisma.calculation.findUnique({
    where: { id },
    include: {
      items: true,
      user: { select: { name: true, email: true } },
      alloy: { include: { components: { include: { metal: true, grade: true, rawMaterial: true } } } }
    }
  });
}

export async function createCalculation(data: {
  batchId: string;
  name: string;
  mode: string;
  userId: string;
  alloyId: string | null;
  totalQuantity: string;
  baseCost: string;
  gstAmount: string;
  finalCost: string;
  snapshot: object;
  status: "DRAFT" | "COMPLETED";
  completedAt: Date | null;
  items: {
    metalId: string | null;
    rawMaterialId: string | null;
    gradeId: string | null;
    itemName: string;
    quantity: string;
    compositionPct: string | null;
    unitPrice: string;
    gradeMultiplier: string;
    extraPrice: string;
    baseCost: string;
    snapshot: object;
  }[];
}) {
  return prisma.calculation.create({
    data: {
      batchId: data.batchId,
      name: data.name,
      mode: data.mode,
      userId: data.userId,
      alloyId: data.alloyId,
      totalQuantity: data.totalQuantity,
      baseCost: data.baseCost,
      gstAmount: data.gstAmount,
      finalCost: data.finalCost,
      snapshot: data.snapshot,
      status: data.status,
      completedAt: data.completedAt,
      items: { create: data.items }
    },
    include: { items: true, alloy: true, user: { select: { name: true } } }
  });
}

export async function completeCalculation(id: string) {
  return prisma.calculation.update({
    where: { id },
    data: { status: "COMPLETED", completedAt: new Date() },
    include: { items: true, user: { select: { name: true } } }
  });
}

export async function cancelCalculation(id: string) {
  return prisma.calculation.update({ where: { id }, data: { status: "CANCELLED" as any } });
}

export async function deleteCalculation(id: string) {
  return prisma.calculation.delete({ where: { id } });
}
