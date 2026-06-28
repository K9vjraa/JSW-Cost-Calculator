import { Router } from "express";
import { z } from "zod";
import { asyncRoute, ApiError, pageArgs } from "../utils/http.js";
import { prisma } from "../prisma/client.js";
import { allowRoles } from "../middleware/auth.js";
import { audit } from "../services/audit.js";
import { calculateBreakdown, defaultChargesFromSettings } from "../services/calculation.js";
import { notify } from "../services/notifications.js";
import { tableSort } from "../utils/table.js";

// ── Zod schemas ───────────────────────────────────────────────────────────────

const chargeSchema = z.object({
  name: z.string().min(1),
  kind: z.enum(["GST", "ADDITIONAL"]),
  rate: z.coerce.number().nonnegative().optional().nullable(),
  amount: z.coerce.number().nonnegative().optional().nullable(),
  taxable: z.boolean().default(true)
});

const itemSchema = z
  .object({
    metalId: z.string().uuid().optional().nullable(),
    rawMaterialId: z.string().uuid().optional().nullable(),
    gradeId: z.string().uuid().optional().nullable(),
    quantity: z.coerce.number().positive(),
    compositionPct: z.coerce.number().positive().max(100).optional().nullable()
  })
  .refine(
    (input) => Boolean(input.metalId) !== Boolean(input.rawMaterialId),
    "Choose exactly one metal or raw material per item."
  );

const calculationSchema = z.object({
  name: z.string().min(2).default("Cost Calculation"),
  mode: z.enum(["metal", "alloy", "raw-material"]),
  alloyId: z.string().uuid().optional().nullable(),
  items: z.array(itemSchema).min(1),
  /** Optional overriding charges. When omitted, defaults from SystemSetting are applied. */
  charges: z.array(chargeSchema).optional()
});

// ── Helpers ───────────────────────────────────────────────────────────────────

async function loadDefaultCharges() {
  const rows = await prisma.systemSetting.findMany({
    where: { key: { in: ["default_gst_rate"] } }
  });
  const map = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  return defaultChargesFromSettings(map);
}

async function resolvePreview(input: z.infer<typeof calculationSchema>) {
  // Resolve each item to price + metadata from master
  const rows = await Promise.all(
    input.items.map(async (item) => {
      const [metal, rawMaterial, grade] = await Promise.all([
        item.metalId ? prisma.metal.findUnique({ where: { id: item.metalId } }) : null,
        item.rawMaterialId ? prisma.rawMaterial.findUnique({ where: { id: item.rawMaterialId } }) : null,
        item.gradeId ? prisma.grade.findUnique({ where: { id: item.gradeId } }) : null
      ]);
      if (!metal && !rawMaterial)
        throw new ApiError(404, "Calculation item master record not found.");
      if (item.metalId && !grade)
        throw new ApiError(400, "Metal calculation items require an active grade.");

      const price = await prisma.priceList.findFirst({
        where: {
          metalId: item.metalId ?? undefined,
          rawMaterialId: item.rawMaterialId ?? undefined,
          active: true,
          effectiveFrom: { lte: new Date() }
        },
        orderBy: { effectiveFrom: "desc" }
      });
      if (!price)
        throw new ApiError(
          400,
          `No active master price exists for ${metal?.name ?? rawMaterial?.materialName}. Please update the price master before costing.`
        );

      return {
        id: item.metalId ?? item.rawMaterialId!,
        metalId: item.metalId,
        rawMaterialId: item.rawMaterialId,
        gradeId: grade?.id ?? null,
        gradeName: grade?.name,
        name: grade?.name ?? rawMaterial?.materialName ?? metal!.name,
        quantity: String(item.quantity),
        compositionPct: item.compositionPct != null ? String(item.compositionPct) : null,
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
        sourceType: (item.metalId ? "metal" : "rawMaterial") as "metal" | "rawMaterial"
      };
    })
  );

  // Resolve charges: use provided or load defaults from settings
  const charges = input.charges?.length ? input.charges : await loadDefaultCharges();

  const breakdown = calculateBreakdown(rows, charges);

  return {
    ...breakdown,
    items: breakdown.items.map((row, index) => ({ ...row, ...rows[index] })),
    snapshot: {
      version: 2,
      mode: input.mode,
      name: input.name,
      pricedAt: new Date().toISOString(),
      masterLocked: true,
      charges: breakdown.charges,
      items: rows
    }
  };
}

async function saveCalculation(
  req: { actor: { id: string; role: string }; ip?: string },
  input: z.infer<typeof calculationSchema>,
  status: "DRAFT" | "COMPLETED"
) {
  const preview = await resolvePreview(input);
  const nextBatch = `BATCH-${Date.now().toString().slice(-8)}`;

  const calculation = await prisma.calculation.create({
    data: {
      batchId: nextBatch,
      name: input.name,
      mode: input.mode,
      userId: req.actor.id,
      alloyId: input.alloyId ?? null,
      totalQuantity: preview.totalQuantity,
      baseCost: preview.baseCost,
      gstAmount: preview.gstAmount,
      finalCost: preview.finalCost,
      snapshot: preview.snapshot as object,
      status,
      completedAt: status === "COMPLETED" ? new Date() : null,
      items: {
        create: preview.items.map((item) => ({
          metalId: item.metalId ?? null,
          rawMaterialId: item.rawMaterialId ?? null,
          gradeId: item.gradeId ?? null,
          itemName: item.name,
          quantity: item.quantity,
          compositionPct: item.compositionPct ?? null,
          unitPrice: item.unitPrice,
          gradeMultiplier: item.gradeMultiplier,
          extraPrice: item.extraPrice,
          baseCost: item.baseCost,
          snapshot: item as object
        }))
      }
    },
    include: { items: true, alloy: true, user: { select: { name: true } } }
  });

  await audit({
    userId: req.actor.id,
    action: status === "COMPLETED" ? "COMPLETE" : "SAVE_DRAFT",
    entity: "Calculation",
    entityId: calculation.id,
    ipAddress: req.ip,
    details: {
      batchId: calculation.batchId,
      mode: calculation.mode,
      finalCost: preview.finalCost,
      gstAmount: preview.gstAmount,
      chargesTotal: preview.chargesTotal
    }
  });

  await notify({
    userId: req.actor.id,
    title: status === "COMPLETED" ? "Calculation completed" : "Draft saved",
    message: `${calculation.batchId} — ${calculation.name} is ready.`,
    category: "CALCULATION"
  });

  return { ...calculation, breakdown: preview };
}

// ── Router ────────────────────────────────────────────────────────────────────

export const calculationRoutes = Router();
const calculationSortFields = ["batchId", "name", "mode", "status", "totalQuantity", "finalCost", "createdAt", "updatedAt"] as const;

/**
 * POST /api/calculations/preview
 * Live recalculation — returns full breakdown without persisting.
 * Used by the workspace for real-time cost display.
 */
calculationRoutes.post(
  "/preview",
  allowRoles("COSTING_DEPARTMENT", "PDQC"),
  asyncRoute(async (req, res) => {
    res.json(await resolvePreview(calculationSchema.parse(req.body)));
  })
);

/**
 * POST /api/calculations
 * Save a new calculation (default: DRAFT).
 */
calculationRoutes.post(
  "/",
  allowRoles("COSTING_DEPARTMENT", "PDQC"),
  asyncRoute(async (req, res) => {
    res.status(201).json(
      await saveCalculation(req as any, calculationSchema.parse(req.body), "DRAFT")
    );
  })
);

/**
 * GET /api/calculations
 * Paginated list with optional filters.
 * Query params: page, limit, status, search, from, to, mode
 */
calculationRoutes.get(
  "/",
  asyncRoute(async (req, res) => {
    const { skip, limit, page } = pageArgs(req.query);
    const { status, search, from, to, mode } = req.query as Record<string, string | undefined>;
    const sort = tableSort(req.query, calculationSortFields, "updatedAt", "desc");

    const baseWhere =
      req.actor!.role === "COSTING_DEPARTMENT"
        ? {}
        : { userId: req.actor!.id };

    const where = {
      ...baseWhere,
      ...(status ? { status: status as any } : {}),
      ...(mode ? { mode } : {}),
      ...(search
        ? {
            OR: [
              { batchId: { contains: search, mode: "insensitive" as const } },
              { name: { contains: search, mode: "insensitive" as const } }
            ]
          }
        : {}),
      ...(from || to
        ? {
            createdAt: {
              ...(from ? { gte: new Date(from) } : {}),
              ...(to ? { lte: new Date(to) } : {})
            }
          }
        : {})
    };

    const [total, data] = await prisma.$transaction([
      prisma.calculation.count({ where }),
      prisma.calculation.findMany({
        where,
        include: {
          user: { select: { name: true } },
          items: true,
          alloy: { select: { id: true, name: true, code: true, type: true } }
        },
        orderBy: sort.orderBy,
        skip,
        take: limit
      })
    ]);

    res.json({ data, pagination: { total, page, limit, pages: Math.ceil(total / limit) } });
  })
);

/**
 * GET /api/calculations/:id
 * Single calculation with full breakdown.
 */
calculationRoutes.get(
  "/:id",
  asyncRoute(async (req, res) => {
    const row = await prisma.calculation.findUnique({
      where: { id: String(req.params.id) },
      include: {
        items: true,
        user: { select: { name: true, email: true } },
        alloy: { include: { components: { include: { metal: true, grade: true, rawMaterial: true } } } }
      }
    });
    if (
      !row ||
      (req.actor!.role !== "COSTING_DEPARTMENT" &&
        row.userId !== req.actor!.id)
    ) {
      throw new ApiError(404, "Calculation not found.");
    }
    res.json(row);
  })
);

/**
 * PUT /api/calculations/:id/draft
 * Replace a DRAFT calculation (recalculate with new items/charges).
 */
calculationRoutes.put(
  "/:id/draft",
  allowRoles("COSTING_DEPARTMENT", "PDQC"),
  asyncRoute(async (req, res) => {
    const current = await prisma.calculation.findUnique({
      where: { id: String(req.params.id) }
    });
    if (!current || (current.userId !== req.actor!.id && req.actor!.role !== "COSTING_DEPARTMENT")) {
      throw new ApiError(404, "Draft calculation not found.");
    }
    if (current.status !== "DRAFT") {
      throw new ApiError(409, "Completed calculations are immutable snapshots.");
    }
    // Delete old draft and recreate with fresh pricing
    await prisma.calculation.delete({ where: { id: current.id } });
    res.json(await saveCalculation(req as any, calculationSchema.parse(req.body), "DRAFT"));
  })
);

/**
 * POST /api/calculations/:id/complete
 * Promote a DRAFT to COMPLETED (locks the snapshot).
 */
calculationRoutes.post(
  "/:id/complete",
  allowRoles("COSTING_DEPARTMENT", "PDQC"),
  asyncRoute(async (req, res) => {
    const row = await prisma.calculation.findUnique({
      where: { id: String(req.params.id) }
    });
    if (!row || (row.userId !== req.actor!.id && req.actor!.role !== "COSTING_DEPARTMENT")) {
      throw new ApiError(404, "Draft calculation not found.");
    }
    if (row.status === "COMPLETED") {
      throw new ApiError(409, "Calculation is already completed.");
    }
    const updated = await prisma.calculation.update({
      where: { id: row.id },
      data: { status: "COMPLETED", completedAt: new Date() },
      include: { items: true, user: { select: { name: true } } }
    });
    await audit({
      userId: req.actor!.id,
      action: "COMPLETE",
      entity: "Calculation",
      entityId: row.id,
      details: { batchId: row.batchId, finalCost: row.finalCost.toString() },
      ipAddress: req.ip
    });
    await notify({
      userId: req.actor!.id,
      title: "Calculation completed",
      message: `${row.batchId} is report-ready.`,
      category: "CALCULATION",
      priority: "HIGH"
    });
    res.json(updated);
  })
);

/**
 * DELETE /api/calculations/:id
 * Soft-delete (ADMIN only or own DRAFT).
 */
calculationRoutes.delete(
  "/:id",
  asyncRoute(async (req, res) => {
    const row = await prisma.calculation.findUnique({
      where: { id: String(req.params.id) }
    });
    if (!row) throw new ApiError(404, "Calculation not found.");
    const canDelete =
      req.actor!.role === "COSTING_DEPARTMENT" ||
      (row.userId === req.actor!.id && row.status === "DRAFT");
    if (!canDelete) {
      throw new ApiError(
        403,
        "Only costing department can delete completed calculations. You can only delete your own drafts."
      );
    }
    await prisma.calculation.update({
      where: { id: row.id },
      data: { status: "CANCELLED" as any }
    });
    await audit({
      userId: req.actor!.id,
      action: "DELETE",
      entity: "Calculation",
      entityId: row.id,
      details: { batchId: row.batchId },
      ipAddress: req.ip
    });
    res.status(204).send();
  })
);

/**
 * GET /api/calculations/defaults/charges
 * Returns the current default charge configuration from SystemSettings.
 * Used by the frontend workspace to pre-populate the charges panel.
 */
calculationRoutes.get(
  "/defaults/charges",
  asyncRoute(async (_req, res) => {
    const charges = await loadDefaultCharges();
    res.json({ charges });
  })
);
