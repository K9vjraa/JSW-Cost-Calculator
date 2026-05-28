import { Router } from "express";
import { z } from "zod";
import { asyncRoute, ApiError, pageArgs } from "../utils/http.js";
import { prisma } from "../prisma/client.js";
import { allowRoles } from "../middleware/auth.js";
import { audit } from "../services/audit.js";
import { tableSort } from "../utils/table.js";

function range(req: { query: Record<string, unknown> }) {
  return {
    from: req.query.from
      ? new Date(String(req.query.from))
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    to: req.query.to ? new Date(String(req.query.to)) : new Date()
  };
}

const reportCreateSchema = z.object({
  name: z.string().min(2),
  type: z.enum(["cost-summary", "trend", "comparison", "audit", "custom"]).default("cost-summary"),
  filters: z.record(z.unknown()).default({})
});

export const reportRoutes = Router();
const reportSortFields = ["name", "type", "createdAt"] as const;

// ─────────────────────────────────────────────────────────────────────────────
// LIST REPORTS
// ─────────────────────────────────────────────────────────────────────────────
reportRoutes.get(
  "/",
  asyncRoute(async (req, res) => {
    const { page, limit, skip } = pageArgs(req.query);
    const type = req.query.type ? String(req.query.type) : undefined;
    const search = req.query.search ? String(req.query.search) : undefined;
    const sort = tableSort(req.query, reportSortFields, "createdAt", "desc");

    const where = {
      ...(type ? { type } : {}),
      ...(search
        ? { name: { contains: search, mode: "insensitive" as const } }
        : {}),
      // Non-admins see only their own reports
      ...(req.actor!.role === "USER" ? { generatedById: req.actor!.id } : {})
    };

    const [total, data] = await prisma.$transaction([
      prisma.report.count({ where }),
      prisma.report.findMany({
        where,
        include: { generatedBy: { select: { name: true } } },
        orderBy: sort.orderBy,
        skip,
        take: limit
      })
    ]);

    res.json({ data, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  })
);

// ─────────────────────────────────────────────────────────────────────────────
// GET SINGLE REPORT
// ─────────────────────────────────────────────────────────────────────────────
reportRoutes.get(
  "/:id",
  asyncRoute(async (req, res) => {
    const row = await prisma.report.findUnique({
      where: { id: String(req.params.id) },
      include: { generatedBy: { select: { name: true, email: true } } }
    });
    if (!row) throw new ApiError(404, "Report not found.");
    if (req.actor!.role === "USER" && row.generatedById !== req.actor!.id) {
      throw new ApiError(403, "Access denied.");
    }
    res.json(row);
  })
);

// ─────────────────────────────────────────────────────────────────────────────
// CREATE REPORT (save a named report snapshot)
// ─────────────────────────────────────────────────────────────────────────────
reportRoutes.post(
  "/",
  allowRoles("ADMIN", "EMPLOYEE"),
  asyncRoute(async (req, res) => {
    const input = reportCreateSchema.parse(req.body);
    const row = await prisma.report.create({
      data: {
        name: input.name,
        type: input.type,
        filters: input.filters as any,
        generatedById: req.actor!.id
      },
      include: { generatedBy: { select: { name: true } } }
    });
    await audit({
      userId: req.actor!.id,
      action: "CREATE",
      entity: "Report",
      entityId: row.id,
      details: { name: row.name, type: row.type },
      ipAddress: req.ip
    });
    res.status(201).json(row);
  })
);

// ─────────────────────────────────────────────────────────────────────────────
// DELETE REPORT (Admin / owner Employee)
// ─────────────────────────────────────────────────────────────────────────────
reportRoutes.delete(
  "/:id",
  allowRoles("ADMIN", "EMPLOYEE"),
  asyncRoute(async (req, res) => {
    const row = await prisma.report.findUnique({ where: { id: String(req.params.id) } });
    if (!row) throw new ApiError(404, "Report not found.");
    if (req.actor!.role !== "ADMIN" && row.generatedById !== req.actor!.id) {
      throw new ApiError(403, "You can only delete reports you generated.");
    }
    await prisma.report.delete({ where: { id: row.id } });
    await audit({
      userId: req.actor!.id,
      action: "DELETE",
      entity: "Report",
      entityId: row.id,
      details: { name: row.name },
      ipAddress: req.ip
    });
    res.status(204).send();
  })
);

// ─────────────────────────────────────────────────────────────────────────────
// ANALYTICS VIEWS (read-only aggregation endpoints)
// ─────────────────────────────────────────────────────────────────────────────

/** GET /api/reports/analytics/cost-summary */
reportRoutes.get(
  "/analytics/cost-summary",
  asyncRoute(async (req, res) => {
    const { from, to } = range(req);
    const data = await prisma.calculation.findMany({
      where: {
        createdAt: { gte: from, lte: to },
        ...(req.actor!.role === "USER" ? { userId: req.actor!.id } : {})
      },
      include: { user: { select: { name: true } }, alloy: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      take: 250
    });

    const totals = {
      calculations: data.length,
      quantity: data.reduce((sum, r) => sum + Number(r.totalQuantity), 0),
      baseCost: data.reduce((sum, r) => sum + Number(r.baseCost), 0),
      gstAmount: data.reduce((sum, r) => sum + Number((r as any).gstAmount ?? 0), 0),
      finalCost: data.reduce((sum, r) => sum + Number(r.finalCost), 0)
    };

    res.json({ filters: { from, to }, totals, data });
  })
);

/** GET /api/reports/analytics/trends */
reportRoutes.get(
  "/analytics/trends",
  asyncRoute(async (req, res) => {
    const { from, to } = range(req);
    const data = await prisma.calculation.findMany({
      where: {
        createdAt: { gte: from, lte: to },
        ...(req.actor!.role === "USER" ? { userId: req.actor!.id } : {})
      },
      select: { createdAt: true, finalCost: true, baseCost: true, status: true, mode: true },
      orderBy: { createdAt: "asc" },
      take: 500
    });
    res.json({ filters: { from, to }, data });
  })
);

/** GET /api/reports/analytics/comparison */
reportRoutes.get(
  "/analytics/comparison",
  asyncRoute(async (_req, res) => {
    const data = await prisma.grade.findMany({
      where: { status: "ACTIVE" },
      include: { metal: { include: { prices: { where: { active: true }, orderBy: { effectiveFrom: "desc" }, take: 1 } } } },
      take: 25,
      orderBy: { updatedAt: "desc" }
    });
    res.json({ data });
  })
);

/** GET /api/reports/analytics/status-breakdown */
reportRoutes.get(
  "/analytics/status-breakdown",
  asyncRoute(async (req, res) => {
    const { from, to } = range(req);
    const where = {
      ...(req.actor!.role === "USER" ? { userId: req.actor!.id } : {}),
      createdAt: { gte: from, lte: to }
    };
    const grouped = await prisma.calculation.groupBy({
      by: ["status"],
      where,
      _count: { id: true },
      _sum: { finalCost: true }
    });
    res.json({
      filters: { from, to },
      data: grouped.map((g) => ({
        status: g.status,
        count: g._count.id,
        totalCost: Number(g._sum.finalCost ?? 0)
      }))
    });
  })
);

/** GET /api/reports/analytics/top-alloys */
reportRoutes.get(
  "/analytics/top-alloys",
  asyncRoute(async (req, res) => {
    const { from, to } = range(req);
    const data = await prisma.calculation.groupBy({
      by: ["alloyId"],
      where: {
        alloyId: { not: null },
        createdAt: { gte: from, lte: to },
        ...(req.actor!.role === "USER" ? { userId: req.actor!.id } : {})
      },
      _count: { id: true },
      _sum: { finalCost: true },
      orderBy: { _sum: { finalCost: "desc" } },
      take: 10
    });

    const alloyIds = data.map((d) => d.alloyId!).filter(Boolean);
    const alloys = await prisma.alloy.findMany({ where: { id: { in: alloyIds } }, select: { id: true, name: true, type: true } });
    const alloyMap = Object.fromEntries(alloys.map((a) => [a.id, a]));

    res.json({
      filters: { from, to },
      data: data.map((d) => ({
        alloy: alloyMap[d.alloyId!] ?? { id: d.alloyId, name: "Unknown" },
        count: d._count.id,
        totalCost: Number(d._sum.finalCost ?? 0)
      }))
    });
  })
);

/** GET /api/reports/analytics/price-history */
reportRoutes.get(
  "/analytics/price-history",
  allowRoles("ADMIN", "EMPLOYEE"),
  asyncRoute(async (req, res) => {
    const { from, to } = range(req);
    const data = await prisma.priceHistory.findMany({
      where: { updatedAt: { gte: from, lte: to } },
      include: {
        metal: { select: { name: true, code: true } },
        rawMaterial: { select: { name: true, code: true } },
        updatedBy: { select: { name: true } }
      },
      orderBy: { updatedAt: "desc" },
      take: 200
    });
    res.json({ filters: { from, to }, data });
  })
);
