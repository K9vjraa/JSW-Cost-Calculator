import { Prisma } from "@prisma/client";
import { prisma } from "../prisma/client.js";
import { ApiError } from "../utils/http.js";

export async function getAllMaterials(query: any) {
  const page = Math.max(1, parseInt(query.page || "1", 10));
  const limit = Math.max(1, parseInt(query.limit || "50", 10));
  const skip = (page - 1) * limit;

  const where: Prisma.RawMaterialWhereInput = {};

  if (query.search) {
    where.materialName = { contains: query.search, mode: "insensitive" };
  }

  if (query.status) {
    where.availability = query.status === "ACTIVE" || query.status === "approved";
  }

  const [total, data] = await Promise.all([
    prisma.rawMaterial.count({ where }),
    prisma.rawMaterial.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        category: true,
        supplier: true
      }
    })
  ]);

  return { total, page, limit, data };
}

export async function getMaterialById(id: string) {
  const material = await prisma.rawMaterial.findUnique({
    where: { id },
    include: {
      category: true,
      supplier: true,
      rates: { where: { isActive: true } }
    }
  });

  if (!material) {
    throw new ApiError(404, "Material Not Found");
  }

  return material;
}

export async function createMaterial(data: any, userId: string) {
  const code = data.code || data.material_code || `MAT-${Date.now()}`;
  return prisma.rawMaterial.create({
    data: {
      materialCode: code,
      materialName: data.name || data.material_name || code,
      description: data.description,
      currentRate: data.currentRate ?? data.current_rate ?? 0,
      isMicro: data.isMicro ?? data.is_micro_alloy ?? false,
      availability: data.availability ?? data.availability ?? true,
      unit: data.unit || "kg",
      categoryId: data.category ?? data.categoryId ?? data.category_id,
      supplierId: data.supplier ?? data.supplierId ?? data.supplier_id,
      updatedById: userId,
      createdById: userId
    }
  });
}

export async function updateMaterial(id: string, data: any, userId: string) {
  const existing = await prisma.rawMaterial.findUnique({
    where: { id }
  });

  if (!existing) {
    throw new ApiError(404, "Material Not Found");
  }

  return prisma.rawMaterial.update({
    where: { id },
    data: {
      materialName: data.name ?? data.material_name,
      description: data.description,
      currentRate: data.currentRate ?? data.current_rate,
      availability: data.availability ?? data.availability ?? (data.status ? data.status === "ACTIVE" : undefined),
      isMicro: data.isMicro ?? data.is_micro_alloy,
      categoryId: data.category ?? data.categoryId ?? data.category_id,
      supplierId: data.supplier ?? data.supplierId ?? data.supplier_id,
      updatedById: userId,
      version: { increment: 1 }
    }
  });
}

export async function updateStatus(id: string, isActive: boolean, userId: string) {
  const existing = await prisma.rawMaterial.findUnique({
    where: { id }
  });

  if (!existing) {
    throw new ApiError(404, "Material Not Found");
  }

  return prisma.rawMaterial.update({
    where: { id },
    data: {
      availability: isActive,
      updatedById: userId,
      version: { increment: 1 }
    }
  });
}

export async function bulkUpdate(ids: string[], isActive: boolean, userId: string) {
  await prisma.rawMaterial.updateMany({
    where: { id: { in: ids } },
    data: {
      availability: isActive,
      updatedById: userId
    }
  });
  
  return { success: true };
}

export async function getCategories() {
  return prisma.materialCategory.findMany({
    orderBy: { name: "asc" }
  });
}

export async function getSuppliers() {
  return prisma.materialSupplier.findMany({
    orderBy: { name: "asc" }
  });
}
