import { Prisma } from "@prisma/client";
import { prisma } from "../prisma/client.js";

export class ComparisonRepository {
  async count(where: Prisma.ComparisonSessionWhereInput): Promise<number> {
    return await prisma.comparisonSession.count({ where });
  }

  async findMany(args: Prisma.ComparisonSessionFindManyArgs) {
    return await prisma.comparisonSession.findMany(args);
  }

  async findUnique(id: string) {
    return await prisma.comparisonSession.findFirst({
      where: { id, deletedAt: null },
      include: {
        items: {
          include: { 
            grade: {
              include: { 
                metal: { include: { prices: true } },
                gradeMaterials: true
              }
            } 
          },
          orderBy: { position: "asc" },
        },
        results: { orderBy: { calculatedAt: "desc" }, take: 1 },
      },
    });
  }

  async create(data: any, userId: string) {
    return await prisma.$transaction(async (tx) => {
      const session = await tx.comparisonSession.create({
        data: {
          name: data.name,
          description: data.description,
          createdById: userId,
          updatedById: userId,
          items: {
            create: data.items.map((item: any) => ({
              gradeId: item.gradeId,
              position: item.position,
              colorCode: item.colorCode,
            })),
          },
        },
      });

      await tx.comparisonHistory.create({
        data: {
          comparisonSessionId: session.id,
          action: "CREATED",
          performedById: userId,
          details: { message: "Session created" },
        },
      });

      return session;
    });
  }

  async update(id: string, data: any, userId: string) {
    return await prisma.$transaction(async (tx) => {
      const updated = await tx.comparisonSession.update({
        where: { id },
        data: {
          name: data.name,
          description: data.description,
          status: data.status,
          updatedById: userId,
        },
      });

      if (data.items) {
        await tx.comparisonItem.deleteMany({ where: { comparisonSessionId: id } });
        await tx.comparisonItem.createMany({
          data: data.items.map((item: any) => ({
            comparisonSessionId: id,
            gradeId: item.gradeId,
            position: item.position,
            colorCode: item.colorCode,
          })),
        });
      }

      await tx.comparisonHistory.create({
        data: {
          comparisonSessionId: id,
          action: "UPDATED",
          performedById: userId,
          details: { message: "Session updated" },
        },
      });

      return updated;
    });
  }

  async delete(id: string, userId: string) {
    return await prisma.$transaction(async (tx) => {
      await tx.comparisonSession.update({
        where: { id },
        data: { deletedAt: new Date(), updatedById: userId },
      });

      await tx.comparisonHistory.create({
        data: {
          comparisonSessionId: id,
          action: "DELETED",
          performedById: userId,
          details: { message: "Session softly deleted" },
        },
      });
    });
  }

  async createResult(id: string, metricsJson: any, costDifference: number) {
    return await prisma.comparisonResult.create({
      data: {
        comparisonSessionId: id,
        metricsJson,
        costDifference: new Prisma.Decimal(costDifference),
      }
    });
  }

  async getHistory(id: string) {
    return await prisma.comparisonHistory.findMany({
      where: { comparisonSessionId: id },
      orderBy: { createdAt: "desc" },
      include: { performedBy: { select: { id: true, name: true } } },
    });
  }

  async getPreferences(userId: string) {
    let prefs = await prisma.comparisonPreference.findUnique({
      where: { userId },
    });

    if (!prefs) {
      prefs = await prisma.comparisonPreference.create({
        data: { userId },
      });
    }
    return prefs;
  }

  async updatePreferences(userId: string, data: any) {
    return await prisma.comparisonPreference.upsert({
      where: { userId },
      create: { userId, ...data },
      update: { ...data },
    });
  }
}
