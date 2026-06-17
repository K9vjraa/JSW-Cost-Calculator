/**
 * ReportService — business logic for report CRUD and analytics.
 */

import { ApiError } from "../utils/http.js";
import { audit } from "./audit.js";
import * as reportRepo from "../repositories/report.repository.js";
import type { CreateReportInput, ReportQueryInput, DateRangeInput } from "../validations/index.js";

export async function listReports(query: ReportQueryInput, userId: string, role: string) {
  return reportRepo.listReports(query, userId, role);
}

export async function getReport(id: string, userId: string, role: string) {
  const row = await reportRepo.findReportById(id);
  if (!row) throw new ApiError(404, "Report not found.");
  if (role === "PDQC" && row.generatedById !== userId) throw new ApiError(403, "Access denied.");
  return row;
}

export async function createReport(
  input: CreateReportInput,
  actorId: string,
  ip?: string
) {
  const row = await reportRepo.createReport({
    name: input.name,
    type: input.type,
    filters: input.filters as object,
    generatedById: actorId
  });
  await audit({
    userId: actorId,
    action: "CREATE",
    entity: "Report",
    entityId: row.id,
    details: { name: row.name, type: row.type },
    ipAddress: ip
  });
  return row;
}

export async function deleteReport(id: string, actorId: string, role: string, ip?: string) {
  const row = await reportRepo.findReportById(id);
  if (!row) throw new ApiError(404, "Report not found.");
  if (role !== "COSTING_DEPARTMENT" && row.generatedById !== actorId) {
    throw new ApiError(403, "You can only delete reports you generated.");
  }
  await reportRepo.deleteReport(id);
  await audit({
    userId: actorId,
    action: "DELETE",
    entity: "Report",
    entityId: id,
    details: { name: row.name },
    ipAddress: ip
  });
}

// ── Analytics ─────────────────────────────────────────────────────────────────

export async function getCostSummary(range: DateRangeInput, userId: string, role: string) {
  const data = await reportRepo.getCostSummary(range.from, range.to, userId, role);
  const totals = {
    calculations: data.length,
    quantity: data.reduce((s, r) => s + Number(r.totalQuantity), 0),
    baseCost: data.reduce((s, r) => s + Number(r.baseCost), 0),
    gstAmount: data.reduce((s, r) => s + Number((r as any).gstAmount ?? 0), 0),
    finalCost: data.reduce((s, r) => s + Number(r.finalCost), 0)
  };
  return { filters: range, totals, data };
}

export async function getTrends(range: DateRangeInput, userId: string, role: string) {
  const data = await reportRepo.getTrends(range.from, range.to, userId, role);
  return { filters: range, data };
}

export async function getComparisonData() {
  return { data: await reportRepo.getComparisonData() };
}

export async function getStatusBreakdown(range: DateRangeInput, userId: string, role: string) {
  const grouped = await reportRepo.getStatusBreakdown(range.from, range.to, userId, role);
  return {
    filters: range,
    data: grouped.map((g) => ({
      status: g.status,
      count: g._count.id,
      totalCost: Number(g._sum.finalCost ?? 0)
    }))
  };
}

export async function getTopAlloys(range: DateRangeInput, userId: string, role: string) {
  const { data, alloys } = await reportRepo.getTopAlloys(range.from, range.to, userId, role);
  const alloyMap = Object.fromEntries(alloys.map((a) => [a.id, a]));
  return {
    filters: range,
    data: data.map((d) => ({
      alloy: alloyMap[d.alloyId!] ?? { id: d.alloyId, name: "Unknown" },
      count: d._count.id,
      totalCost: Number(d._sum.finalCost ?? 0)
    }))
  };
}

export async function getPriceHistoryReport(range: DateRangeInput) {
  const data = await reportRepo.getPriceHistory(range.from, range.to);
  return { filters: range, data };
}
