import { Router } from "express";
import { asyncRoute, pageArgs } from "../utils/http.js";
import { prisma } from "../prisma/client.js";
import { allowRoles } from "../middleware/auth.js";

export const auditRoutes = Router();

auditRoutes.get("/", allowRoles("ADMIN", "EMPLOYEE"), asyncRoute(async (req, res) => {
  const { page, limit, skip } = pageArgs(req.query);
  const [total, data] = await prisma.$transaction([
    prisma.auditLog.count(),
    prisma.auditLog.findMany({ include: { user: { select: { name: true, email: true } } }, orderBy: { createdAt: "desc" }, skip, take: limit })
  ]);
  res.json({ data, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
}));
