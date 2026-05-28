import { Router } from "express";
import { z } from "zod";
import { asyncRoute, ApiError, pageArgs } from "../utils/http.js";
import { prisma } from "../prisma/client.js";
import { allowRoles } from "../middleware/auth.js";
import { audit } from "../services/audit.js";

const settingUpdateSchema = z.object({
  value: z.string().min(1),
  label: z.string().optional(),
  description: z.string().optional()
});

const gstSchema = z.object({
  name: z.string().min(2),
  code: z.string().min(2),
  rate: z.coerce.number().nonnegative().max(100),
  description: z.string().optional(),
  active: z.boolean().default(true)
});

export const settingsRoutes = Router();

// ── System Settings ──────────────────────────────────────────────────────────

settingsRoutes.get("/", asyncRoute(async (req, res) => {
  const category = req.query.category ? String(req.query.category) : undefined;
  const settings = await prisma.systemSetting.findMany({
    where: category ? { category } : {},
    orderBy: [{ category: "asc" }, { key: "asc" }]
  });
  res.json({ data: settings });
}));

settingsRoutes.get("/:key", asyncRoute(async (req, res) => {
  const setting = await prisma.systemSetting.findUnique({ where: { key: String(req.params.key) } });
  if (!setting) throw new ApiError(404, "Setting not found.");
  res.json(setting);
}));

settingsRoutes.put("/:key", allowRoles("ADMIN"), asyncRoute(async (req, res) => {
  const input = settingUpdateSchema.parse(req.body);
  const row = await prisma.systemSetting.update({
    where: { key: String(req.params.key) },
    data: { ...input, updatedById: req.actor!.id }
  });
  await audit({
    userId: req.actor!.id,
    action: "UPDATE",
    entity: "SystemSetting",
    entityId: row.id,
    details: { key: row.key, value: row.value },
    ipAddress: req.ip
  });
  res.json(row);
}));

// ── GST Slabs ─────────────────────────────────────────────────────────────

settingsRoutes.get("/gst/slabs", asyncRoute(async (_req, res) => {
  const data = await prisma.gstSlab.findMany({ orderBy: { rate: "asc" } });
  res.json({ data });
}));

settingsRoutes.post("/gst/slabs", allowRoles("ADMIN"), asyncRoute(async (req, res) => {
  const row = await prisma.gstSlab.create({ data: gstSchema.parse(req.body) });
  await audit({ userId: req.actor!.id, action: "CREATE", entity: "GstSlab", entityId: row.id, details: { code: row.code, rate: row.rate.toString() }, ipAddress: req.ip });
  res.status(201).json(row);
}));

settingsRoutes.put("/gst/slabs/:id", allowRoles("ADMIN"), asyncRoute(async (req, res) => {
  const row = await prisma.gstSlab.update({
    where: { id: String(req.params.id) },
    data: gstSchema.partial().parse(req.body)
  });
  await audit({ userId: req.actor!.id, action: "UPDATE", entity: "GstSlab", entityId: row.id, details: { code: row.code, rate: row.rate.toString() }, ipAddress: req.ip });
  res.json(row);
}));

settingsRoutes.delete("/gst/slabs/:id", allowRoles("ADMIN"), asyncRoute(async (req, res) => {
  await prisma.gstSlab.update({ where: { id: String(req.params.id) }, data: { active: false } });
  await audit({ userId: req.actor!.id, action: "DEACTIVATE", entity: "GstSlab", entityId: String(req.params.id), details: {}, ipAddress: req.ip });
  res.status(204).send();
}));
