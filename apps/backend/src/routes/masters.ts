import { Router } from "express";
import { z } from "zod";
import { asyncRoute, ApiError, pageArgs } from "../utils/http.js";
import { prisma } from "../prisma/client.js";
import { allowRoles } from "../middleware/auth.js";
import { audit } from "../services/audit.js";
import { notify } from "../services/notifications.js";
import { tableSort } from "../utils/table.js";

const statusSchema = z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE");
const propertySchema = z.record(z.string(), z.string()).default({});
const metalSchema = z.object({
  name: z.string().min(2),
  code: z.string().min(2),
  category: z.string().min(2),
  unit: z.string().default("kg"),
  status: statusSchema,
  description: z.string().optional()
});
const rawSchema = z.object({ name: z.string().min(2), code: z.string().min(2), unit: z.string().default("kg"), status: statusSchema, description: z.string().optional() });
const gradeSchema = z.object({
  metalId: z.string().uuid(),
  name: z.string().min(2),
  subGrade: z.string().optional().nullable(),
  multiplier: z.coerce.number().positive(),
  extraPrice: z.coerce.number().nonnegative().default(0),
  status: statusSchema,
  mechanicalProperties: propertySchema,
  toleranceProperties: propertySchema,
  bendProperties: propertySchema,
  chemicalComposition: propertySchema
});
const supplierSchema = z.object({ name: z.string().min(2), code: z.string().min(2), contactName: z.string().optional(), email: z.string().email(), phone: z.string().optional(), status: statusSchema });
const priceBaseSchema = z.object({
  metalId: z.string().uuid().optional().nullable(),
  rawMaterialId: z.string().uuid().optional().nullable(),
  supplierId: z.string().uuid().optional().nullable(),
  pricePerUnit: z.coerce.number().nonnegative(),
  currency: z.string().default("INR"),
  unit: z.string().default("kg"),
  source: z.string().min(2),
  location: z.string().default("India"),
  effectiveFrom: z.coerce.date(),
  active: z.boolean().default(true),
  reason: z.string().optional()
});
const priceSchema = priceBaseSchema.refine((input) => Boolean(input.metalId) !== Boolean(input.rawMaterialId), "Choose exactly one priced metal or raw material.");
const chargeSchema = z.object({
  name: z.string().min(2),
  kind: z.enum(["GST", "ADDITIONAL"]),
  rate: z.coerce.number().nonnegative().optional().nullable(),
  amount: z.coerce.number().nonnegative().optional().nullable(),
  unit: z.string().default("FLAT"),
  taxable: z.boolean().default(true),
  active: z.boolean().default(true)
});
const componentSchema = z.object({
  metalId: z.string().uuid().optional().nullable(),
  gradeId: z.string().uuid().optional().nullable(),
  rawMaterialId: z.string().uuid().optional().nullable(),
  compositionPercent: z.coerce.number().positive().max(100),
  quantity: z.coerce.number().positive().optional().nullable()
});
const alloyBaseSchema = z.object({
  name: z.string().min(2),
  code: z.string().min(2),
  type: z.string().min(2),
  status: statusSchema,
  components: z.array(componentSchema).min(1)
});
const alloySchema = alloyBaseSchema.superRefine((input, ctx) => {
  const composition = input.components.reduce((sum, component) => sum + component.compositionPercent, 0);
  if (composition > 100.0001) ctx.addIssue({ code: "custom", message: "Alloy composition cannot exceed 100 percent." });
});

export const masterRoutes = Router();

const metalSortFields = ["name", "code", "category", "status", "createdAt"] as const;
const gradeSortFields = ["name", "subGrade", "multiplier", "extraPrice", "status", "createdAt"] as const;

async function auditMutation(req: any, action: string, entity: string, entityId: string, details: Record<string, unknown>) {
  await audit({ userId: req.actor!.id, action, entity, entityId, details, ipAddress: req.ip });
}

function paged(req: any, count: number, data: unknown[]) {
  const { page, limit } = pageArgs(req.query);
  return { data, pagination: { page, limit, total: count, pages: Math.ceil(count / limit) } };
}

masterRoutes.get("/metals", asyncRoute(async (req, res) => {
  const { skip, limit } = pageArgs(req.query);
  const search = String(req.query.search ?? "");
  const { category, status } = req.query as Record<string, string | undefined>;
  const sort = tableSort(req.query, metalSortFields, "name", "asc");
  const where = {
    ...(category ? { category } : {}),
    ...(status ? { status } : {}),
    ...(search ? { OR: [{ name: { contains: search, mode: "insensitive" as const } }, { code: { contains: search, mode: "insensitive" as const } }] } : {})
  };
  const [count, data] = await prisma.$transaction([
    prisma.metal.count({ where }),
    prisma.metal.findMany({ where, include: { grades: true, prices: { where: { active: true }, orderBy: { effectiveFrom: "desc" }, take: 1 } }, orderBy: sort.orderBy, skip, take: limit })
  ]);
  res.json(paged(req, count, data));
}));
masterRoutes.post("/metals", allowRoles("ADMIN"), asyncRoute(async (req, res) => {
  const row = await prisma.metal.create({ data: metalSchema.parse(req.body) });
  await auditMutation(req, "CREATE", "Metal", row.id, { code: row.code });
  res.status(201).json(row);
}));
masterRoutes.put("/metals/:id", allowRoles("ADMIN"), asyncRoute(async (req, res) => {
  const row = await prisma.metal.update({ where: { id: String(req.params.id) }, data: metalSchema.partial().parse(req.body) });
  await auditMutation(req, "UPDATE", "Metal", row.id, { code: row.code });
  res.json(row);
}));
masterRoutes.delete("/metals/:id", allowRoles("ADMIN"), asyncRoute(async (req, res) => {
  await prisma.metal.update({ where: { id: String(req.params.id) }, data: { status: "INACTIVE" } });
  await auditMutation(req, "DEACTIVATE", "Metal", String(req.params.id), {});
  res.status(204).send();
}));

masterRoutes.get("/grades", asyncRoute(async (req, res) => {
  const { skip, limit } = pageArgs(req.query);
  const { metalId, status, search } = req.query as Record<string, string | undefined>;
  const sort = tableSort(req.query, gradeSortFields, "name", "asc");
  const where = {
    ...(metalId ? { metalId } : {}),
    ...(status ? { status } : {}),
    ...(search ? { OR: [{ name: { contains: search, mode: "insensitive" as const } }, { subGrade: { contains: search, mode: "insensitive" as const } }] } : {})
  };
  const [count, data] = await prisma.$transaction([prisma.grade.count({ where }), prisma.grade.findMany({ where, include: { metal: true }, skip, take: limit, orderBy: sort.orderBy })]);
  res.json(paged(req, count, data));
}));
masterRoutes.post("/grades", allowRoles("ADMIN"), asyncRoute(async (req, res) => {
  const row = await prisma.grade.create({ data: gradeSchema.parse(req.body) });
  await auditMutation(req, "CREATE", "Grade", row.id, { name: row.name });
  res.status(201).json(row);
}));
masterRoutes.put("/grades/:id", allowRoles("ADMIN"), asyncRoute(async (req, res) => {
  const row = await prisma.grade.update({ where: { id: String(req.params.id) }, data: gradeSchema.partial().parse(req.body) });
  await auditMutation(req, "UPDATE", "Grade", row.id, { name: row.name });
  res.json(row);
}));
masterRoutes.delete("/grades/:id", allowRoles("ADMIN"), asyncRoute(async (req, res) => {
  await prisma.grade.update({ where: { id: String(req.params.id) }, data: { status: "INACTIVE" } });
  await auditMutation(req, "DEACTIVATE", "Grade", String(req.params.id), {});
  res.status(204).send();
}));

masterRoutes.get("/raw-materials", asyncRoute(async (req, res) => {
  const { skip, limit } = pageArgs(req.query);
  const [count, data] = await prisma.$transaction([
    prisma.rawMaterial.count(),
    prisma.rawMaterial.findMany({ include: { prices: { where: { active: true }, orderBy: { effectiveFrom: "desc" }, take: 1 } }, skip, take: limit, orderBy: { name: "asc" } })
  ]);
  res.json(paged(req, count, data));
}));
masterRoutes.post("/raw-materials", allowRoles("ADMIN"), asyncRoute(async (req, res) => {
  const row = await prisma.rawMaterial.create({ data: rawSchema.parse(req.body) });
  await auditMutation(req, "CREATE", "RawMaterial", row.id, { code: row.code });
  res.status(201).json(row);
}));
masterRoutes.put("/raw-materials/:id", allowRoles("ADMIN"), asyncRoute(async (req, res) => {
  const row = await prisma.rawMaterial.update({ where: { id: String(req.params.id) }, data: rawSchema.partial().parse(req.body) });
  await auditMutation(req, "UPDATE", "RawMaterial", row.id, { code: row.code });
  res.json(row);
}));
masterRoutes.delete("/raw-materials/:id", allowRoles("ADMIN"), asyncRoute(async (req, res) => {
  await prisma.rawMaterial.update({ where: { id: String(req.params.id) }, data: { status: "INACTIVE" } });
  await auditMutation(req, "DEACTIVATE", "RawMaterial", String(req.params.id), {});
  res.status(204).send();
}));

masterRoutes.get("/suppliers", asyncRoute(async (req, res) => {
  const { skip, limit } = pageArgs(req.query);
  const [count, data] = await prisma.$transaction([prisma.supplier.count(), prisma.supplier.findMany({ include: { _count: { select: { prices: true } } }, skip, take: limit, orderBy: { name: "asc" } })]);
  res.json(paged(req, count, data));
}));
masterRoutes.post("/suppliers", allowRoles("ADMIN"), asyncRoute(async (req, res) => {
  const row = await prisma.supplier.create({ data: supplierSchema.parse(req.body) });
  await auditMutation(req, "CREATE", "Supplier", row.id, { code: row.code });
  res.status(201).json(row);
}));
masterRoutes.put("/suppliers/:id", allowRoles("ADMIN"), asyncRoute(async (req, res) => {
  const row = await prisma.supplier.update({ where: { id: String(req.params.id) }, data: supplierSchema.partial().parse(req.body) });
  await auditMutation(req, "UPDATE", "Supplier", row.id, { code: row.code });
  res.json(row);
}));
masterRoutes.delete("/suppliers/:id", allowRoles("ADMIN"), asyncRoute(async (req, res) => {
  await prisma.supplier.update({ where: { id: String(req.params.id) }, data: { status: "INACTIVE" } });
  await auditMutation(req, "DEACTIVATE", "Supplier", String(req.params.id), {});
  res.status(204).send();
}));

masterRoutes.get("/prices", asyncRoute(async (req, res) => {
  const { skip, limit } = pageArgs(req.query);
  const where = { metalId: req.query.metalId ? String(req.query.metalId) : undefined, rawMaterialId: req.query.rawMaterialId ? String(req.query.rawMaterialId) : undefined };
  const [count, data] = await prisma.$transaction([
    prisma.priceList.count({ where }),
    prisma.priceList.findMany({ where, include: { metal: true, rawMaterial: true, supplier: true }, orderBy: { effectiveFrom: "desc" }, skip, take: limit })
  ]);
  res.json(paged(req, count, data));
}));
masterRoutes.post("/prices", allowRoles("ADMIN"), asyncRoute(async (req, res) => {
  const input = priceSchema.parse(req.body);
  const current = await prisma.priceList.findFirst({ where: { metalId: input.metalId ?? undefined, rawMaterialId: input.rawMaterialId ?? undefined, active: true }, orderBy: { effectiveFrom: "desc" } });
  const row = await prisma.priceList.create({ data: { ...input, effectiveFrom: input.effectiveFrom } });
  await prisma.priceHistory.create({ data: { metalId: input.metalId, rawMaterialId: input.rawMaterialId, oldPrice: current?.pricePerUnit, newPrice: input.pricePerUnit, reason: input.reason, updatedById: req.actor!.id } });
  await auditMutation(req, "PRICE_UPDATE", "PriceList", row.id, { previous: current?.pricePerUnit?.toString(), next: input.pricePerUnit });
  await notify({ title: "Price master updated", message: `${input.source} published a master-locked price.`, category: "PRICE", priority: "HIGH" });
  res.status(201).json(row);
}));
masterRoutes.put("/prices/:id", allowRoles("ADMIN"), asyncRoute(async (req, res) => {
  const row = await prisma.priceList.update({ where: { id: String(req.params.id) }, data: priceBaseSchema.partial().parse(req.body) });
  await auditMutation(req, "UPDATE", "PriceList", row.id, { active: row.active });
  res.json(row);
}));
masterRoutes.delete("/prices/:id", allowRoles("ADMIN"), asyncRoute(async (req, res) => {
  await prisma.priceList.update({ where: { id: String(req.params.id) }, data: { active: false } });
  await auditMutation(req, "DEACTIVATE", "PriceList", String(req.params.id), {});
  res.status(204).send();
}));

masterRoutes.get("/price-history", asyncRoute(async (req, res) => {
  const { skip, limit } = pageArgs(req.query);
  const [count, data] = await prisma.$transaction([
    prisma.priceHistory.count(),
    prisma.priceHistory.findMany({ include: { metal: true, rawMaterial: true, updatedBy: { select: { name: true } } }, orderBy: { updatedAt: "desc" }, skip, take: limit })
  ]);
  res.json(paged(req, count, data));
}));

masterRoutes.get("/alloys", asyncRoute(async (req, res) => {
  const { skip, limit } = pageArgs(req.query);
  const [count, data] = await prisma.$transaction([
    prisma.alloy.count(),
    prisma.alloy.findMany({ include: { components: { include: { metal: true, grade: true, rawMaterial: true } }, createdBy: { select: { name: true } } }, orderBy: { updatedAt: "desc" }, skip, take: limit })
  ]);
  res.json(paged(req, count, data));
}));
masterRoutes.post("/alloys", allowRoles("ADMIN", "EMPLOYEE"), asyncRoute(async (req, res) => {
  const input = alloySchema.parse(req.body);
  const row = await prisma.alloy.create({ data: { ...input, createdById: req.actor!.id, components: { create: input.components } }, include: { components: true } });
  await auditMutation(req, "CREATE", "Alloy", row.id, { code: row.code });
  res.status(201).json(row);
}));
masterRoutes.put("/alloys/:id", allowRoles("ADMIN", "EMPLOYEE"), asyncRoute(async (req, res) => {
  const input = alloyBaseSchema.partial().parse(req.body);
  const row = await prisma.$transaction(async (tx) => {
    if (input.components) {
      await tx.alloyComponent.deleteMany({ where: { alloyId: String(req.params.id) } });
    }
    return tx.alloy.update({
      where: { id: String(req.params.id) },
      data: { ...input, components: input.components ? { create: input.components } : undefined },
      include: { components: true }
    });
  });
  await auditMutation(req, "UPDATE", "Alloy", row.id, { code: row.code });
  res.json(row);
}));
masterRoutes.delete("/alloys/:id", allowRoles("ADMIN"), asyncRoute(async (req, res) => {
  await prisma.alloy.update({ where: { id: String(req.params.id) }, data: { status: "INACTIVE" } });
  await auditMutation(req, "DEACTIVATE", "Alloy", String(req.params.id), {});
  res.status(204).send();
}));
