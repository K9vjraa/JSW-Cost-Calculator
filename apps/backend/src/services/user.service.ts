import { audit } from "./audit.js";
import * as userRepo from "../repositories/user.repository.js";
import type { CreateUserInput, UpdateUserInput, UserQueryInput } from "../validations/index.js";
import crypto from "node:crypto";

export async function listUsers(query: UserQueryInput) {
  return userRepo.listUsers(query);
}

export async function createUser(input: CreateUserInput, actorId: string, ip?: string) {
  const row = await userRepo.createUser({
    id: input.id || crypto.randomUUID(),
    name: input.name,
    email: input.email.toLowerCase(),
    department: input.department,
    role: input.role
  });
  await audit({
    userId: actorId,
    action: "CREATE",
    entity: "User",
    entityId: row.id,
    details: { email: row.email, role: row.role },
    ipAddress: ip
  });
  return row;
}

export async function updateUser(
  id: string,
  input: UpdateUserInput,
  actorId: string,
  ip?: string
) {
  const row = await userRepo.updateUser(id, {
    name: input.name,
    email: input.email?.toLowerCase(),
    department: input.department,
    role: input.role
  });
  await audit({
    userId: actorId,
    action: "UPDATE",
    entity: "User",
    entityId: row.id,
    details: { email: row.email, role: row.role },
    ipAddress: ip
  });
  return row;
}

export async function deactivateUser(id: string, actorId: string, ip?: string) {
  await userRepo.deactivateUser(id);
  await audit({
    userId: actorId,
    action: "DEACTIVATE",
    entity: "User",
    entityId: id,
    details: {},
    ipAddress: ip
  });
}
