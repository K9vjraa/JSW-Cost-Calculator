import { Prisma } from "@prisma/client";
import { prisma } from "../prisma/client.js";
import { ApiError } from "../utils/http.js";


export class PriceManagementService {
  static async updatePrice(data: {
    materialId: string;
    newRate: number;
    reason: string;
    remarks?: string | null;
    effectiveDate: string;
  }, userId: string) {
    const material = await prisma.rawMaterial.findUnique({
      where: { id: data.materialId }
    });

    if (!material) {
      throw new ApiError(404, "Material not found");
    }

    const oldRateNum = material.currentRate ? Number(material.currentRate) : 0;
    const newRateNum = data.newRate;
    
    const rateDifference = newRateNum - oldRateNum;
    let percentageChange = 0;
    if (oldRateNum > 0) {
      percentageChange = (rateDifference / oldRateNum) * 100;
    }

    const warningFlag = Math.abs(percentageChange) > 20;

    await prisma.$transaction(async (tx) => {
      // 1. Update current rate and increment version
      await tx.rawMaterial.update({
        where: { id: data.materialId },
        data: { 
          currentRate: newRateNum, 
          updatedById: userId,
          version: { increment: 1 }
        }
      });

      // 2. Insert into MaterialPriceHistory
      await tx.materialPriceHistory.create({
        data: {
          rawMaterialId: data.materialId,
          oldRate: oldRateNum,
          newRate: newRateNum,
          reason: data.reason,
          effectiveDate: data.effectiveDate ? new Date(data.effectiveDate) : new Date(),
          updatedById: userId
        }
      });

      // 3. Create MaterialAuditLog
      await tx.materialAuditLog.create({
        data: {
          rawMaterialId: data.materialId,
          action: "PRICE_CHANGE",
          details: { oldRate: oldRateNum, newRate: newRateNum, reason: data.reason, remarks: data.remarks },
          userId: userId
        }
      });

      // 4. Upsert/create active MaterialRate
      // Deactivate all previous rates for this material
      await tx.materialRate.updateMany({
        where: { rawMaterialId: data.materialId, isActive: true },
        data: { isActive: false, effectiveTo: new Date() }
      });
      
      // Create new active rate
      await tx.materialRate.create({
        data: {
          rawMaterialId: data.materialId,
          rate: newRateNum,
          effectiveFrom: data.effectiveDate ? new Date(data.effectiveDate) : new Date(),
          isActive: true
        }
      });
    });

    return { warningFlag };
  }

  static async getPriceHistory(query: any) {
    const page = Math.max(1, parseInt(query.page || "1", 10));
    const limit = Math.max(1, parseInt(query.limit || "50", 10));
    const skip = (page - 1) * limit;

    const where: Prisma.MaterialPriceHistoryWhereInput = {};

    if (query.materialId) {
      where.rawMaterialId = query.materialId;
    }

    if (query.userId) {
      where.updatedById = query.userId;
    }

    if (query.startDate && query.endDate) {
      where.createdAt = {
        gte: new Date(query.startDate),
        lte: new Date(query.endDate)
      };
    }

    const [total, data] = await Promise.all([
      prisma.materialPriceHistory.count({ where }),
      prisma.materialPriceHistory.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          rawMaterial: { select: { materialName: true, materialCode: true, description: true } },
          updatedBy: { select: { name: true, email: true } }
        }
      })
    ]);

    return { total, page, limit, data };
  }

  static async getMaterialPriceHistory(materialId: string) {
    return prisma.materialPriceHistory.findMany({
      where: { rawMaterialId: materialId },
      orderBy: { createdAt: "desc" },
      include: {
        updatedBy: { select: { name: true, email: true } }
      }
    });
  }

  static async getRecentUpdates() {
    return prisma.materialPriceHistory.findMany({
      take: 20,
      orderBy: { createdAt: "desc" },
      include: {
        rawMaterial: { select: { materialName: true } },
        updatedBy: { select: { name: true } }
      }
    });
  }

  static async getPriceTrend(materialId: string) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const history = await prisma.materialPriceHistory.findMany({
      where: {
        rawMaterialId: materialId,
        createdAt: { gte: thirtyDaysAgo }
      },
      orderBy: { createdAt: "asc" },
      select: { createdAt: true, newRate: true }
    });

    return history.map(h => ({
      date: h.createdAt.toISOString(),
      rate: Number(h.newRate)
    }));
  }
}
