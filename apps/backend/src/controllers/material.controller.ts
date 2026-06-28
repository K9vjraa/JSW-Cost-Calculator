import { Request, Response } from "express";
import { asyncRoute } from "../utils/http.js";
import { ok, created, paginated, buildPagination, noContent } from "../utils/response.js";
import * as materialService from "../services/material.service.js";
import {
  materialQuerySchema,
  createMaterialSchema,
  updateMaterialSchema,
  statusUpdateSchema,
  bulkUpdateSchema
} from "../validations/material.schema.js";

export const getAllMaterials = asyncRoute(async (req: Request, res: Response) => {
  const query = materialQuerySchema.parse(req.query);
  const result = await materialService.getAllMaterials(query);
  paginated(res, result.data, buildPagination(result.page, result.limit, result.total));
});

export const getCategories = asyncRoute(async (req: Request, res: Response) => {
  const categories = await materialService.getCategories();
  ok(res, categories);
});

export const getSuppliers = asyncRoute(async (req: Request, res: Response) => {
  const suppliers = await materialService.getSuppliers();
  ok(res, suppliers);
});

export const getMaterialById = asyncRoute(async (req: Request, res: Response) => {
  const material = await materialService.getMaterialById(String(req.params.id));
  ok(res, material);
});

export const createMaterial = asyncRoute(async (req: Request, res: Response) => {
  const data = createMaterialSchema.parse(req.body);
  const material = await materialService.createMaterial(data, req.actor!.id);
  created(res, material);
});

export const updateMaterial = asyncRoute(async (req: Request, res: Response) => {
  const data = updateMaterialSchema.parse(req.body);
  const material = await materialService.updateMaterial(String(req.params.id), data, req.actor!.id);
  ok(res, material);
});

export const updateStatus = asyncRoute(async (req: Request, res: Response) => {
  const data = statusUpdateSchema.parse(req.body);
  const material = await materialService.updateStatus(String(req.params.id), data.status === "ACTIVE", req.actor!.id);
  ok(res, material);
});

export const deactivateMaterial = asyncRoute(async (req: Request, res: Response) => {
  await materialService.updateStatus(String(req.params.id), false, req.actor!.id);
  noContent(res);
});

export const bulkUpdate = asyncRoute(async (req: Request, res: Response) => {
  const data = bulkUpdateSchema.parse(req.body);
  const result = await materialService.bulkUpdate(data.ids, data.status === "ACTIVE", req.actor!.id);
  ok(res, result);
});
