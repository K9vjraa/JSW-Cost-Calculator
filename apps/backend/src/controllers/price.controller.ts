import { Request, Response } from "express";
import { asyncRoute } from "../utils/http.js";
import { ok, paginated, buildPagination } from "../utils/response.js";
import { PriceManagementService } from "../services/price.service.js";
import { priceUpdateSchema, priceHistoryQuerySchema } from "../validations/priceHistory.schema.js";

export const updatePrice = asyncRoute(async (req: Request, res: Response) => {
  const data = priceUpdateSchema.parse(req.body);
  const result = await PriceManagementService.updatePrice(data, req.actor!.id);
  res.status(200).json({
    success: true,
    message: "Price Updated Successfully",
    data: result
  });
});

export const getPriceHistory = asyncRoute(async (req: Request, res: Response) => {
  const query = priceHistoryQuerySchema.parse(req.query);
  const result = await PriceManagementService.getPriceHistory(query);
  paginated(res, result.data, buildPagination(result.page, result.limit, result.total));
});

export const getMaterialPriceHistory = asyncRoute(async (req: Request, res: Response) => {
  const history = await PriceManagementService.getMaterialPriceHistory(String(req.params.id));
  ok(res, history);
});

export const getRecentUpdates = asyncRoute(async (req: Request, res: Response) => {
  const updates = await PriceManagementService.getRecentUpdates();
  ok(res, updates);
});

export const getPriceTrend = asyncRoute(async (req: Request, res: Response) => {
  const trend = await PriceManagementService.getPriceTrend(String(req.params.id));
  ok(res, trend);
});
