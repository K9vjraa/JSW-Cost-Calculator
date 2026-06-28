import { Router } from "express";
import { asyncRoute } from "../utils/http.js";
import { prisma } from "../prisma/client.js";

export const searchRoutes = Router();

searchRoutes.get("/", asyncRoute(async (req, res) => {
  const query = req.query.q ? String(req.query.q).trim() : "";
  const limit = req.query.limit ? Math.min(Number(req.query.limit), 50) : 10;

  if (!query) {
    return res.json({
      metals: [],
      grades: [],
      calculations: [],
      reports: [],
      users: []
    });
  }

  // Parallel database execution for minimal latency
  const [metals, grades, calculations, reports, users] = await Promise.all([
    prisma.metal.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { code: { contains: query, mode: "insensitive" } }
        ]
      },
      take: limit,
      select: { id: true, name: true, code: true, category: true, status: true }
    }),
    prisma.grade.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { subGrade: { contains: query, mode: "insensitive" } }
        ]
      },
      take: limit,
      select: { id: true, name: true, subGrade: true, metalId: true, status: true }
    }),
    prisma.calculation.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { batchId: { contains: query, mode: "insensitive" } }
        ]
      },
      take: limit,
      select: { id: true, name: true, batchId: true, mode: true, status: true, finalCost: true, createdAt: true }
    }),
    prisma.report.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { type: { contains: query, mode: "insensitive" } }
        ]
      },
      take: limit,
      select: { id: true, name: true, type: true, createdAt: true }
    }),
    prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { email: { contains: query, mode: "insensitive" } }
        ]
      },
      take: limit,
      select: { id: true, name: true, email: true, department: true }
    })
  ]);

  res.json({
    metals,
    grades,
    calculations,
    reports,
    users
  });
}));
