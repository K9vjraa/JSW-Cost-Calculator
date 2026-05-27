import { Router } from "express";
import { z } from "zod";
import { asyncRoute, ApiError, pageArgs } from "../utils/http.js";
import { prisma } from "../prisma/client.js";
import { allowRoles } from "../middleware/auth.js";
import { audit } from "../services/audit.js";
import { calculateBreakdown } from "../services/calculation.js";
import { notify } from "../services/notifications.js";

const itemSchema = z.object({
  metalId: z.string().uuid().optional().nullable(),
  rawMaterialId: z.string().uuid().optional().nullable(),
  gradeId: z.string().uuid().optional().nullable(),
  quantity: z.coerce.number().positive(),
  compositionPct: z.coerce.number().positive().max(100).optional().nullable()
}).refine((input) => Boolean(input.metalId) !== Boolean(input.rawMaterialId), "Choose exactly one metal or raw material.");
const calculationSchema = z.object({
  name: z.string().min(2).default("Cost Calculation"),
  mode: z.enum(["metal", "alloy", "raw-material"]),
  alloyId: z.string().uuid().optional().nullable(),
  items: z.array(itemSchema).min(1)
});

async function resolvePreview(input: z.infer<typeof calculationSchema>) {
  const rows = await Promise.all(input.items.map(async (item) => {
    const [metal, rawMaterial, grade] = await Promise.all([
      item.metalId ? prisma.metal.findUnique({ where: { id: item.metalId } }) : null,
      item.rawMaterialId ? prisma.rawMaterial.findUnique({ where: { id: item.rawMaterialId } }) : null,
      item.gradeId ? prisma.grade.findUnique({ where: { id: item.gradeId } }) : null
    ]);
    if (!metal && !rawMaterial) throw new ApiError(404, "Calculation item master record not found.");
    if (item.metalId && !grade) throw new ApiError(400, "Metal calculation items require an active grade.");
    const price = await prisma.priceList.findFirst({
      where: { metalId: item.metalId ?? undefined, rawMaterialId: item.rawMaterialId ?? undefined, active: true, effectiveFrom: { lte: new Date() } },
      orderBy: { effectiveFrom: "desc" }
    });
    if (!price) throw new ApiError(400, `No active master price exists for ${metal?.name ?? rawMaterial?.name}.`);
    return {
      id: item.metalId ?? item.rawMaterialId!,
      metalId: item.metalId,
      rawMaterialId: item.rawMaterialId,
      gradeId: grade?.id,
      gradeName: grade?.name,
      name: grade?.name ?? rawMaterial?.name ?? metal!.name,
      quantity: String(item.quantity),
      compositionPct: item.compositionPct ? String(item.compositionPct) : null,
      unitPrice: price.pricePerUnit.toString(),
      gradeMultiplier: grade?.multiplier.toString() ?? "1",
      extraPrice: grade?.extraPrice.toString() ?? "0",
      priceSnapshot: {
        priceListId: price.id,
        source: price.source,
        effectiveFrom: price.effectiveFrom,
        currency: price.currency,
        unit: price.unit
      },
      sourceType: item.metalId ? "metal" as const : "rawMaterial" as const
    };
  }));

  const breakdown = calculateBreakdown(rows, []);
  return {
    ...breakdown,
    items: breakdown.items.map((row, index) => ({ ...row, ...rows[index] })),
    snapshot: {
      version: 1,
      mode: input.mode,
      name: input.name,
      pricedAt: new Date().toISOString(),
      masterLocked: true,
      charges: [],
      items: rows
    }
  };
}

async function saveCalculation(req: any, input: z.infer<typeof calculationSchema>, status: "DRAFT" | "COMPLETED") {
  const preview = await resolvePreview(input);
  const nextBatch = `BATCH-${Date.now().toString().slice(-8)}`;
  const calculation = await prisma.calculation.create({
    data: {
      batchId: nextBatch,
      name: input.name,
      mode: input.mode,
      userId: req.actor.id,
      alloyId: input.alloyId,
      totalQuantity: preview.totalQuantity,
      baseCost: preview.baseCost,
      finalCost: preview.finalCost,
      snapshot: preview.snapshot,
      status,
      completedAt: status === "COMPLETED" ? new Date() : null,
      items: {
        create: preview.items.map((item) => ({
          metalId: item.metalId,
          rawMaterialId: item.rawMaterialId,
          gradeId: item.gradeId,
          itemName: item.name,
          quantity: item.quantity,
          compositionPct: item.compositionPct,
          unitPrice: item.unitPrice,
          gradeMultiplier: item.gradeMultiplier,
          extraPrice: item.extraPrice,
          baseCost: item.baseCost,
          snapshot: item
        }))
      }
    },
    include: { items: true }
  });
  await audit({ userId: req.actor.id, action: status === "COMPLETED" ? "COMPLETE" : "SAVE_DRAFT", entity: "Calculation", entityId: calculation.id, ipAddress: req.ip, details: { batchId: calculation.batchId, mode: calculation.mode } });
  await notify({ userId: req.actor.id, title: status === "COMPLETED" ? "Calculation completed" : "Draft saved", message: `${calculation.batchId} is available in My Calculations.`, category: "CALCULATION" });
  return calculation;
}

export const calculationRoutes = Router();

calculationRoutes.post("/preview", allowRoles("ADMIN", "EMPLOYEE", "USER"), asyncRoute(async (req, res) => {
  res.json(await resolvePreview(calculationSchema.parse(req.body)));
}));
calculationRoutes.post("/", allowRoles("ADMIN", "EMPLOYEE", "USER"), asyncRoute(async (req, res) => {
  res.status(201).json(await saveCalculation(req, calculationSchema.parse(req.body), "DRAFT"));
}));
calculationRoutes.get("/", asyncRoute(async (req, res) => {
  const { skip, limit, page } = pageArgs(req.query);
  const where = req.actor!.role === "ADMIN" || req.actor!.role === "EMPLOYEE" ? {} : { userId: req.actor!.id };
  const [total, data] = await prisma.$transaction([
    prisma.calculation.count({ where }),
    prisma.calculation.findMany({ where, include: { user: { select: { name: true } }, items: true, alloy: true }, orderBy: { updatedAt: "desc" }, skip, take: limit })
  ]);
  res.json({ data, pagination: { total, page, limit, pages: Math.ceil(total / limit) } });
}));
calculationRoutes.get("/:id", asyncRoute(async (req, res) => {
  const row = await prisma.calculation.findUnique({ where: { id: String(req.params.id) }, include: { items: true, user: { select: { name: true } }, alloy: true } });
  if (!row || (req.actor!.role !== "ADMIN" && req.actor!.role !== "EMPLOYEE" && row.userId !== req.actor!.id)) throw new ApiError(404, "Calculation not found.");
  res.json(row);
}));
calculationRoutes.put("/:id/draft", allowRoles("ADMIN", "EMPLOYEE", "USER"), asyncRoute(async (req, res) => {
  const current = await prisma.calculation.findUnique({ where: { id: String(req.params.id) } });
  if (!current || (current.userId !== req.actor!.id && req.actor!.role !== "ADMIN")) throw new ApiError(404, "Draft calculation not found.");
  if (current.status !== "DRAFT") throw new ApiError(409, "Completed calculations are immutable snapshots.");
  await prisma.calculation.delete({ where: { id: current.id } });
  res.json(await saveCalculation(req, calculationSchema.parse(req.body), "DRAFT"));
}));
calculationRoutes.post("/:id/complete", allowRoles("ADMIN", "EMPLOYEE", "USER"), asyncRoute(async (req, res) => {
  const row = await prisma.calculation.findUnique({ where: { id: String(req.params.id) } });
  if (!row || (row.userId !== req.actor!.id && req.actor!.role !== "ADMIN")) throw new ApiError(404, "Draft calculation not found.");
  const updated = await prisma.calculation.update({ where: { id: row.id }, data: { status: "COMPLETED", completedAt: new Date() } });
  await audit({ userId: req.actor!.id, action: "COMPLETE", entity: "Calculation", entityId: row.id, details: { batchId: row.batchId }, ipAddress: req.ip });
  await notify({ userId: req.actor!.id, title: "Calculation completed", message: `${row.batchId} is report ready.`, category: "CALCULATION" });
  res.json(updated);
}));
