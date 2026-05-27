import { Router } from "express";
import { asyncRoute } from "../utils/http.js";
import { prisma } from "../prisma/client.js";

function range(req: any) {
  return {
    from: req.query.from ? new Date(String(req.query.from)) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    to: req.query.to ? new Date(String(req.query.to)) : new Date()
  };
}

export const reportRoutes = Router();

reportRoutes.get("/cost-summary", asyncRoute(async (req, res) => {
  const { from, to } = range(req);
  const data = await prisma.calculation.findMany({
    where: { createdAt: { gte: from, lte: to } },
    include: { user: { select: { name: true } }, alloy: true },
    orderBy: { createdAt: "desc" },
    take: 250
  });
  res.json({
    filters: { from, to },
    totals: {
      calculations: data.length,
      quantity: data.reduce((sum, row) => sum + Number(row.totalQuantity), 0),
      cost: data.reduce((sum, row) => sum + Number(row.finalCost), 0)
    },
    data
  });
}));

reportRoutes.get("/trends", asyncRoute(async (req, res) => {
  const { from, to } = range(req);
  const data = await prisma.calculation.findMany({ where: { createdAt: { gte: from, lte: to } }, select: { createdAt: true, finalCost: true, status: true }, orderBy: { createdAt: "asc" }, take: 500 });
  res.json({ filters: { from, to }, data });
}));

reportRoutes.get("/comparison", asyncRoute(async (_req, res) => {
  const data = await prisma.grade.findMany({ include: { metal: true }, take: 25, orderBy: { updatedAt: "desc" } });
  res.json({ data });
}));
