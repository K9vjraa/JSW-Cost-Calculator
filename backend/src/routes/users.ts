import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { asyncRoute, pageArgs } from "../utils/http.js";
import { prisma } from "../prisma/client.js";
import { allowRoles } from "../middleware/auth.js";
import { audit } from "../services/audit.js";

const userSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8).optional(),
  department: z.string().optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
  roleId: z.string().uuid()
});

export const userRoutes = Router();
userRoutes.use(allowRoles("ADMIN"));

userRoutes.get("/", asyncRoute(async (req, res) => {
  const { page, limit, skip } = pageArgs(req.query);
  const [total, data] = await prisma.$transaction([
    prisma.user.count(),
    prisma.user.findMany({ select: { id: true, name: true, email: true, department: true, status: true, lastLoginAt: true, role: true }, orderBy: { createdAt: "desc" }, skip, take: limit })
  ]);
  res.json({ data, roles: await prisma.role.findMany({ orderBy: { name: "asc" } }), pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
}));

userRoutes.post("/", asyncRoute(async (req, res) => {
  const input = userSchema.extend({ password: z.string().min(8) }).parse(req.body);
  const row = await prisma.user.create({ data: { ...input, email: input.email.toLowerCase(), passwordHash: await bcrypt.hash(input.password, 12) }, select: { id: true, name: true, email: true, role: true, department: true, status: true } });
  await audit({ userId: req.actor!.id, action: "CREATE", entity: "User", entityId: row.id, details: { email: row.email, role: row.role.name }, ipAddress: req.ip });
  res.status(201).json(row);
}));

userRoutes.put("/:id", asyncRoute(async (req, res) => {
  const input = userSchema.partial().parse(req.body);
  const row = await prisma.user.update({
    where: { id: String(req.params.id) },
    data: { ...input, email: input.email?.toLowerCase(), passwordHash: input.password ? await bcrypt.hash(input.password, 12) : undefined },
    select: { id: true, name: true, email: true, role: true, department: true, status: true }
  });
  await audit({ userId: req.actor!.id, action: "UPDATE", entity: "User", entityId: row.id, details: { email: row.email }, ipAddress: req.ip });
  res.json(row);
}));

userRoutes.delete("/:id", asyncRoute(async (req, res) => {
  const id = String(req.params.id);
  await prisma.user.update({ where: { id }, data: { status: "INACTIVE" } });
  await audit({ userId: req.actor!.id, action: "DEACTIVATE", entity: "User", entityId: id, details: {}, ipAddress: req.ip });
  res.status(204).send();
}));
