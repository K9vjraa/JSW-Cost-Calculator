import { prisma } from "../prisma/client.js";

export interface AuditEventInput {
  userId?: string;
  userName?: string;
  email?: string;
  department?: string;
  role?: string;
  action: string;
  resource: string;
  status?: string;
  ipAddress?: string;
  userAgent?: string;
  details?: any;
}

export const auditService = {
  /**
   * Log an event asynchronously.
   * Catches errors internally to prevent failing the main request.
   */
  logEvent: (input: AuditEventInput) => {
    // Fire and forget
    const details = {
      ...input.details,
      userName: input.userName,
      email: input.email,
      department: input.department,
      role: input.role,
      status: input.status,
      userAgent: input.userAgent,
    };

    const promise = prisma.auditLog.create({
      data: {
        userId: input.userId,
        action: input.action,
        entity: input.resource,
        ipAddress: input.ipAddress,
        details: details,
      },
    });

    if (promise && typeof promise.catch === "function") {
      promise.catch((err) => {
        console.error("[MCMS Audit] Failed to record audit log:", err.message);
      });
    }

    return promise;
  },

  /**
   * Fetch paginated audit logs
   */
  getLogs: async (
    params: {
      userId?: string;
      action?: string;
      entity?: string;
      search?: string;
    },
    pagination: { page: number; limit: number; sortBy: string; sortDir: "asc" | "desc" }
  ) => {
    const where: any = {};

    if (params.userId) where.userId = params.userId;
    if (params.action) where.action = params.action;
    if (params.entity) where.entity = params.entity;

    if (params.search) {
      where.OR = [
        { action: { contains: params.search, mode: "insensitive" } },
        { entity: { contains: params.search, mode: "insensitive" } },
        { ipAddress: { contains: params.search, mode: "insensitive" } },
      ];
    }

    const [total, data] = await Promise.all([
      prisma.auditLog.count({ where }),
      prisma.auditLog.findMany({
        where,
        orderBy: { [pagination.sortBy]: pagination.sortDir },
        skip: (pagination.page - 1) * pagination.limit,
        take: pagination.limit,
        include: {
          user: {
            select: {
              name: true,
              email: true
            }
          }
        }
      }),
    ]);

    return {
      data,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total,
        pages: Math.ceil(total / pagination.limit),
      },
    };
  },
};
