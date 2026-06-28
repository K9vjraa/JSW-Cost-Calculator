/**
 * UserRepository — Prisma data-access for User (profiles) model.
 */

import { prisma, paginate } from "./base.repository.js";
import { tableSort } from "../utils/table.js";
import type { UserQueryInput } from "../validations/index.js";

const userSortFields = ["name", "email", "department", "role", "createdAt"] as const;

export async function listUsers(query: UserQueryInput) {
  const { page, limit } = query;
  const skip = (page - 1) * limit;
  const sort = tableSort(
    { sortBy: query.sortBy, sortDir: query.sortDir },
    userSortFields,
    "createdAt",
    "desc"
  );
  const where = {
    ...(query.search
      ? {
          OR: [
            { name: { contains: query.search, mode: "insensitive" as const } },
            { email: { contains: query.search, mode: "insensitive" as const } }
          ]
        }
      : {})
  };
  const [total, data] = await paginate(
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      select: { id: true, name: true, email: true, department: true, role: true, createdAt: true },
      orderBy: sort.orderBy,
      skip,
      take: limit
    })
  );
  const roles = [
    { id: "COSTING_DEPARTMENT", name: "COSTING_DEPARTMENT", description: "Costing Department" },
    { id: "PDQC", name: "PDQC", description: "PDQC Specialist" }
  ];
  return { data, total, page, limit, roles };
}

export async function findUserById(id: string) {
  return prisma.user.findUnique({
    where: { id },
    select: { id: true, name: true, email: true, department: true, role: true }
  });
}

export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({ where: { email } });
}

export async function createUser(data: {
  id: string;
  name: string;
  email: string;
  department?: any;
  role: string;
}) {
  return prisma.user.create({
    data: {
      id: data.id,
      name: data.name,
      email: data.email,
      department: data.department,
      role: data.role
    },
    select: { id: true, name: true, email: true, role: true, department: true }
  });
}

export async function updateUser(
  id: string,
  data: {
    name?: string;
    email?: string;
    department?: any;
    role?: string;
  }
) {
  return prisma.user.update({
    where: { id },
    data,
    select: { id: true, name: true, email: true, role: true, department: true }
  });
}

export async function deactivateUser(id: string) {
  // Mock deactivate or delete profile
  return prisma.user.delete({ where: { id } });
}

export async function incrementFailedLogin(id: string, failedCount: number) {
  return null;
}

export async function recordSuccessfulLogin(id: string) {
  return null;
}

export async function listRoles() {
  return [
    { id: "COSTING_DEPARTMENT", name: "COSTING_DEPARTMENT", description: "Costing Department" },
    { id: "PDQC", name: "PDQC", description: "PDQC Specialist" }
  ];
}
