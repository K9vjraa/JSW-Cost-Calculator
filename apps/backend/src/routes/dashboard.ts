import { Router } from "express";
import { asyncRoute } from "../utils/http.js";
import { prisma } from "../prisma/client.js";
import { allowRoles } from "../middleware/auth.js";

function dateLabel(offset: number) {
  const date = new Date(Date.now() - offset * 24 * 60 * 60 * 1000);
  return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
}

async function calculationSeries(userId?: string) {
  const calculations = await prisma.calculation.findMany({
    where: userId ? { userId } : {},
    select: { createdAt: true, finalCost: true },
    orderBy: { createdAt: "asc" },
    take: 120
  });
  const buckets = Array.from({ length: 7 }, (_, index) => ({ label: dateLabel(6 - index), count: 0, cost: 0 }));
  calculations.forEach((calc) => {
    const days = Math.floor((Date.now() - calc.createdAt.getTime()) / (24 * 60 * 60 * 1000));
    if (days >= 0 && days < 7) {
      const bucket = buckets[6 - days];
      bucket.count += 1;
      bucket.cost += Number(calc.finalCost);
    }
  });
  return buckets;
}

export const dashboardRoutes = Router();

dashboardRoutes.get("/admin", allowRoles("COSTING_DEPARTMENT"), asyncRoute(async (_req, res) => {
  const [calculations, alloys, rawMaterials, activeUsers, metals, recent, activity, notices, series] = await Promise.all([
    prisma.calculation.count(),
    prisma.alloy.count({ where: { status: "ACTIVE" } }),
    prisma.rawMaterial.count({ where: { status: "ACTIVE" } }),
    prisma.user.count(),
    prisma.metal.count({ where: { status: "ACTIVE" } }),
    prisma.calculation.findMany({ include: { user: { select: { name: true } }, alloy: true }, orderBy: { updatedAt: "desc" }, take: 5 }),
    prisma.auditLog.findMany({ include: { user: { select: { name: true } } }, orderBy: { createdAt: "desc" }, take: 6 }),
    prisma.notification.findMany({ orderBy: { createdAt: "desc" }, take: 4 }),
    calculationSeries()
  ]);
  res.json({
    kpis: { calculations, alloys, rawMaterials, activeUsers, metals, estimatedValue: recent.reduce((total, row) => total + Number(row.finalCost), 0) },
    series,
    topAlloys: [{ name: "SS304", value: 42 }, { name: "SS316", value: 28 }, { name: "Alloy Steel", value: 18 }, { name: "Carbon Steel", value: 12 }],
    statuses: [{ name: "Completed", value: 82 }, { name: "Draft", value: 12 }, { name: "Cancelled", value: 4 }, { name: "In Progress", value: 2 }],
    recent,
    activity,
    notices,
    systemSummary: { roles: 2, gstSlabs: await prisma.gstSlab.count({ where: { active: true } }), priceLists: await prisma.priceList.count({ where: { active: true } }), reports: await prisma.report.count() }
  });
}));

dashboardRoutes.get("/user", asyncRoute(async (req, res) => {
  const where = req.actor!.role === "COSTING_DEPARTMENT" ? {} : { userId: req.actor!.id };
  const [calculations, savedAlloys, recent, notices, series] = await Promise.all([
    prisma.calculation.count({ where }),
    prisma.alloy.count({ where: req.actor!.role === "COSTING_DEPARTMENT" ? {} : { createdById: req.actor!.id } }),
    prisma.calculation.findMany({ where, include: { alloy: true }, orderBy: { updatedAt: "desc" }, take: 4 }),
    prisma.notification.findMany({ where: { OR: [{ userId: req.actor!.id }, { userId: null }] }, orderBy: { createdAt: "desc" }, take: 5 }),
    calculationSeries(req.actor!.role === "COSTING_DEPARTMENT" ? undefined : req.actor!.id)
  ]);
  res.json({
    kpis: {
      calculations,
      savedAlloys,
      estimatedValue: recent.reduce((total, row) => total + Number(row.finalCost), 0),
      recentActivity: recent.length
    },
    recent,
    notices,
    series,
    saved: await prisma.alloy.findMany({ where: req.actor!.role === "COSTING_DEPARTMENT" ? {} : { createdById: req.actor!.id }, orderBy: { updatedAt: "desc" }, take: 4 })
  });
}));
