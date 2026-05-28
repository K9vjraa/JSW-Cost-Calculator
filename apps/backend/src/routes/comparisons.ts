import { Router } from "express";
import { z } from "zod";
import { asyncRoute } from "../utils/http.js";
import { prisma } from "../prisma/client.js";

export const comparisonRoutes = Router();

comparisonRoutes.get("/", asyncRoute(async (_req, res) => {
  const grades = await prisma.grade.findMany({ where: { status: "ACTIVE" }, include: { metal: true }, take: 12, orderBy: { name: "asc" } });
  res.json({ data: grades });
}));

comparisonRoutes.post("/preview", asyncRoute(async (req, res) => {
  const input = z.object({ gradeIds: z.array(z.string().uuid()).min(2).max(4) }).parse(req.body);
  const data = await prisma.grade.findMany({ where: { id: { in: input.gradeIds } }, include: { metal: { include: { prices: { where: { active: true }, orderBy: { effectiveFrom: "desc" }, take: 1 } } } } });
  res.json({
    data: data.map((grade) => ({
      id: grade.id,
      name: grade.name,
      metal: grade.metal.name,
      type: grade.metal.category,
      price: grade.metal.prices[0]?.pricePerUnit ?? null,
      mechanicalProperties: grade.mechanicalProperties,
      toleranceProperties: grade.toleranceProperties,
      bendProperties: grade.bendProperties,
      chemicalComposition: grade.chemicalComposition
    }))
  });
}));
