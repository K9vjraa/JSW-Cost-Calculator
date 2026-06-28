/**
 * ReportRepository — Prisma data-access for Report model and analytics queries.
 */

import { prisma, paginate } from "./base.repository.js";
import { tableSort } from "../utils/table.js";
import type { ReportQueryInput } from "../validations/index.js";

const reportSortFields = ["name", "type", "createdAt"] as const;

export async function listReports(query: ReportQueryInput, userId: string, role: string) {
  const { page, limit } = query;
  const skip = (page - 1) * limit;
  const sort = tableSort(
    { sortBy: query.sortBy, sortDir: query.sortDir },
    reportSortFields,
    "createdAt",
    "desc"
  );
  const where = {
    ...(query.type ? { type: query.type } : {}),
    ...(query.search ? { name: { contains: query.search, mode: "insensitive" as const } } : {}),
    ...(role === "USER" ? { generatedById: userId } : {})
  };
  const [total, data] = await paginate(
    prisma.report.count({ where }),
    prisma.report.findMany({
      where,
      include: { generatedBy: { select: { name: true } } },
      orderBy: sort.orderBy,
      skip,
      take: limit
    })
  );
  return { data, total, page, limit };
}

export async function findReportById(id: string) {
  return prisma.report.findUnique({
    where: { id },
    include: { generatedBy: { select: { name: true, email: true } } }
  });
}

export async function createReport(data: {
  name: string;
  type: string;
  filters: object;
  generatedById: string;
}) {
  return prisma.report.create({
    data,
    include: { generatedBy: { select: { name: true } } }
  });
}

export async function deleteReport(id: string) {
  return prisma.report.delete({ where: { id } });
}

// ── Analytics ─────────────────────────────────────────────────────────────────

export async function getCostSummary(from: Date, to: Date, userId: string, role: string) {
  return prisma.calculation.findMany({
    where: {
      createdAt: { gte: from, lte: to },
      ...(role === "USER" ? { userId } : {})
    },
    include: {
      user: { select: { name: true } },
      alloy: { select: { name: true } }
    },
    orderBy: { createdAt: "desc" },
    take: 250
  });
}

export async function getTrends(from: Date, to: Date, userId: string, role: string) {
  return prisma.calculation.findMany({
    where: {
      createdAt: { gte: from, lte: to },
      ...(role === "USER" ? { userId } : {})
    },
    select: { createdAt: true, finalCost: true, baseCost: true, status: true, mode: true },
    orderBy: { createdAt: "asc" },
    take: 500
  });
}

export async function getStatusBreakdown(from: Date, to: Date, userId: string, role: string) {
  const where = {
    ...(role === "USER" ? { userId } : {}),
    createdAt: { gte: from, lte: to }
  };
  return prisma.calculation.groupBy({
    by: ["status"],
    where,
    _count: { id: true },
    _sum: { finalCost: true }
  });
}

export async function getTopAlloys(from: Date, to: Date, userId: string, role: string) {
  const data = await prisma.calculation.groupBy({
    by: ["alloyId"],
    where: {
      alloyId: { not: null },
      createdAt: { gte: from, lte: to },
      ...(role === "USER" ? { userId } : {})
    },
    _count: { id: true },
    _sum: { finalCost: true },
    orderBy: { _sum: { finalCost: "desc" } },
    take: 10
  });
  const alloyIds = data.map((d) => d.alloyId!).filter(Boolean);
  const alloys = await prisma.alloy.findMany({
    where: { id: { in: alloyIds } },
    select: { id: true, name: true, type: true }
  });
  return { data, alloys };
}

export async function getPriceHistory(from: Date, to: Date) {
  return prisma.priceHistory.findMany({
    where: { updatedAt: { gte: from, lte: to } },
    include: {
      metal: { select: { name: true, code: true } },
      rawMaterial: { select: { materialName: true, materialCode: true } },
      updatedBy: { select: { name: true } }
    },
    orderBy: { updatedAt: "desc" },
    take: 200
  });
}

export async function getComparisonData() {
  return prisma.grade.findMany({
    where: { status: "ACTIVE" },
    include: {
      metal: {
        include: {
          prices: { where: { active: true }, orderBy: { effectiveFrom: "desc" }, take: 1 }
        }
      }
    },
    take: 25,
    orderBy: { name: "asc" }
  });
}
