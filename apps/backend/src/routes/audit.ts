import { Router } from "express";
import { asyncRoute, pageArgs } from "../utils/http.js";
import { prisma } from "../prisma/client.js";
import { allowRoles } from "../middleware/auth.js";
import type { Prisma } from "@prisma/client";
import { tableSort } from "../utils/table.js";

export const auditRoutes = Router();
const auditSortFields = ["action", "entity", "ipAddress", "createdAt"] as const;

auditRoutes.get(
  "/",
  allowRoles("ADMIN", "EMPLOYEE"),
  asyncRoute(async (req, res) => {
    const { page, limit, skip } = pageArgs(req.query);

    const search = req.query.search as string | undefined;
    const action = req.query.action as string | undefined;
    const entity = req.query.entity as string | undefined;
    const userId = req.query.userId as string | undefined;
    const startDate = req.query.startDate as string | undefined;
    const endDate = req.query.endDate as string | undefined;
    const from = req.query.from as string | undefined;
    const to = req.query.to as string | undefined;
    const sort = tableSort(req.query, auditSortFields, "createdAt", "desc");

    // Construct Prisma where filters
    const where: Prisma.AuditLogWhereInput = {};

    if (action) {
      where.action = action;
    }

    if (entity) {
      where.entity = entity;
    }

    if (userId) {
      where.userId = userId;
    }

    if (startDate || endDate || from || to) {
      where.createdAt = {};
      if (startDate || from) {
        where.createdAt.gte = new Date(startDate ?? from!);
      }
      if (endDate || to) {
        where.createdAt.lte = new Date(endDate ?? to!);
      }
    }

    if (search) {
      const trimmedSearch = search.trim();
      where.OR = [
        { action: { contains: trimmedSearch, mode: "insensitive" } },
        { entity: { contains: trimmedSearch, mode: "insensitive" } },
        { entityId: { contains: trimmedSearch, mode: "insensitive" } },
        { ipAddress: { contains: trimmedSearch, mode: "insensitive" } },
        {
          user: {
            OR: [
              { name: { contains: trimmedSearch, mode: "insensitive" } },
              { email: { contains: trimmedSearch, mode: "insensitive" } }
            ]
          }
        }
      ];
    }

    const [total, data] = await prisma.$transaction([
      prisma.auditLog.count({ where }),
      prisma.auditLog.findMany({
        where,
        include: {
          user: {
            select: {
              name: true,
              email: true,
              role: {
                select: {
                  name: true
                }
              }
            }
          }
        },
        orderBy: sort.orderBy,
        skip,
        take: limit
      })
    ]);

    res.json({
      data,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  })
);
