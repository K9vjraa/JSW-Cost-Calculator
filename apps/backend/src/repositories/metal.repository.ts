/**
 * MetalRepository — all Prisma data-access for Metal, RawMaterial, Supplier,
 * PriceList, PriceHistory, and Alloy models.
 */

import { prisma, paginate } from "./base.repository.js";
import { tableSort } from "../utils/table.js";
import type {
  CreateMetalInput,
  UpdateMetalInput,
  CreateAlloyInput,
  MetalQueryInput
} from "../validations/index.js";

// ── Metal ─────────────────────────────────────────────────────────────────────

const metalSortFields = ["name", "code", "category", "status", "createdAt"] as const;

export async function listMetals(query: MetalQueryInput) {
  const { page, limit } = query;
  const skip = (page - 1) * limit;
  const sort = tableSort({ sortBy: query.sortBy, sortDir: query.sortDir }, metalSortFields, "name", "asc");
  const where = {
    ...(query.category ? { category: query.category } : {}),
    ...(query.status ? { status: query.status } : {}),
    ...(query.search
      ? {
          OR: [
            { name: { contains: query.search, mode: "insensitive" as const } },
            { code: { contains: query.search, mode: "insensitive" as const } }
          ]
        }
      : {})
  };
  const [total, data] = await paginate(
    prisma.metal.count({ where }),
    prisma.metal.findMany({
      where,
      include: {
        grades: true,
        prices: { where: { active: true }, orderBy: { effectiveFrom: "desc" }, take: 1 }
      },
      orderBy: sort.orderBy,
      skip,
      take: limit
    })
  );
  return { data, total, page, limit };
}

export async function createMetal(data: CreateMetalInput) {
  return prisma.metal.create({ data });
}

export async function updateMetal(id: string, data: UpdateMetalInput) {
  return prisma.metal.update({ where: { id }, data });
}

export async function deactivateMetal(id: string) {
  return prisma.metal.update({ where: { id }, data: { status: "INACTIVE" } });
}

// ── Raw Material ──────────────────────────────────────────────────────────────

export async function listRawMaterials(page: number, limit: number) {
  const skip = (page - 1) * limit;
  const [total, data] = await paginate(
    prisma.rawMaterial.count(),
    prisma.rawMaterial.findMany({
      include: { prices: { where: { active: true }, orderBy: { effectiveFrom: "desc" }, take: 1 } },
      skip,
      take: limit,
      orderBy: { materialName: "asc" }
    })
  );
  return { data, total, page, limit };
}

export async function createRawMaterial(data: object) {
  return prisma.rawMaterial.create({ data: data as any });
}

export async function updateRawMaterial(id: string, data: object) {
  return prisma.rawMaterial.update({ where: { id }, data: data as any });
}

export async function deactivateRawMaterial(id: string) {
  return prisma.rawMaterial.update({ where: { id }, data: { status: "INACTIVE" } });
}

// ── Supplier ──────────────────────────────────────────────────────────────────

export async function listSuppliers(page: number, limit: number) {
  const skip = (page - 1) * limit;
  const [total, data] = await paginate(
    prisma.supplier.count(),
    prisma.supplier.findMany({
      include: { _count: { select: { prices: true } } },
      skip,
      take: limit,
      orderBy: { name: "asc" }
    })
  );
  return { data, total, page, limit };
}

export async function createSupplier(data: object) {
  return prisma.supplier.create({ data: data as any });
}

export async function updateSupplier(id: string, data: object) {
  return prisma.supplier.update({ where: { id }, data: data as any });
}

export async function deactivateSupplier(id: string) {
  return prisma.supplier.update({ where: { id }, data: { status: "INACTIVE" } });
}

// ── Price List ────────────────────────────────────────────────────────────────

export async function listPrices(page: number, limit: number, metalId?: string, rawMaterialId?: string) {
  const skip = (page - 1) * limit;
  const where = {
    ...(metalId ? { metalId } : {}),
    ...(rawMaterialId ? { rawMaterialId } : {})
  };
  const [total, data] = await paginate(
    prisma.priceList.count({ where }),
    prisma.priceList.findMany({
      where,
      include: { metal: true, rawMaterial: true, supplier: true },
      orderBy: { effectiveFrom: "desc" },
      skip,
      take: limit
    })
  );
  return { data, total, page, limit };
}

export async function findActivePrice(metalId?: string | null, rawMaterialId?: string | null) {
  return prisma.priceList.findFirst({
    where: {
      metalId: metalId ?? undefined,
      rawMaterialId: rawMaterialId ?? undefined,
      active: true
    },
    orderBy: { effectiveFrom: "desc" }
  });
}

export async function createPrice(data: object) {
  return prisma.priceList.create({ data: data as any });
}

export async function updatePrice(id: string, data: object) {
  return prisma.priceList.update({ where: { id }, data: data as any });
}

export async function deactivatePrice(id: string) {
  return prisma.priceList.update({ where: { id }, data: { active: false } });
}

export async function createPriceHistory(data: object) {
  return prisma.priceHistory.create({ data: data as any });
}

export async function listPriceHistory(page: number, limit: number) {
  const skip = (page - 1) * limit;
  const [total, data] = await paginate(
    prisma.priceHistory.count(),
    prisma.priceHistory.findMany({
      include: { metal: true, rawMaterial: true, updatedBy: { select: { name: true } } },
      orderBy: { updatedAt: "desc" },
      skip,
      take: limit
    })
  );
  return { data, total, page, limit };
}

// ── Alloy ─────────────────────────────────────────────────────────────────────

export async function listAlloys(page: number, limit: number) {
  const skip = (page - 1) * limit;
  const [total, data] = await paginate(
    prisma.alloy.count(),
    prisma.alloy.findMany({
      include: {
        components: { include: { metal: true, grade: true, rawMaterial: true } },
        createdBy: { select: { name: true } }
      },
      orderBy: { updatedAt: "desc" },
      skip,
      take: limit
    })
  );
  return { data, total, page, limit };
}

export async function createAlloy(data: CreateAlloyInput, createdById: string) {
  const { components, ...rest } = data;
  return prisma.alloy.create({
    data: { ...rest, createdById, components: { create: components } },
    include: { components: true }
  });
}

export async function updateAlloy(id: string, data: Partial<CreateAlloyInput>) {
  const { components, ...rest } = data;
  return prisma.$transaction(async (tx) => {
    if (components) {
      await tx.alloyComponent.deleteMany({ where: { alloyId: id } });
    }
    return tx.alloy.update({
      where: { id },
      data: { ...rest, components: components ? { create: components } : undefined },
      include: { components: true }
    });
  });
}

export async function deactivateAlloy(id: string) {
  return prisma.alloy.update({ where: { id }, data: { status: "INACTIVE" } });
}
