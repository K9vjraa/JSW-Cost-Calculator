import { Router } from "express";
import { allowRoles } from "../middleware/auth.js";
import * as materialCtrl from "../controllers/material.controller.js";

export const materialRoutes = Router();

materialRoutes.get("/", materialCtrl.getAllMaterials);
materialRoutes.get("/categories", materialCtrl.getCategories);
materialRoutes.get("/suppliers", materialCtrl.getSuppliers);

materialRoutes.post("/", allowRoles("COSTING_DEPARTMENT"), materialCtrl.createMaterial);
materialRoutes.put("/:id", allowRoles("COSTING_DEPARTMENT"), materialCtrl.updateMaterial);
materialRoutes.patch("/:id/status", allowRoles("COSTING_DEPARTMENT"), materialCtrl.updateStatus);
materialRoutes.delete("/:id", allowRoles("COSTING_DEPARTMENT"), materialCtrl.deactivateMaterial);

materialRoutes.post("/bulk-update", allowRoles("COSTING_DEPARTMENT"), materialCtrl.bulkUpdate);

// Price History Routes
import * as priceCtrl from "../controllers/price.controller.js";

materialRoutes.post("/price-update", allowRoles("COSTING_DEPARTMENT"), priceCtrl.updatePrice);
materialRoutes.get("/price-history", priceCtrl.getPriceHistory);
materialRoutes.get("/recent-updates", priceCtrl.getRecentUpdates);
materialRoutes.get("/:id/price-history", priceCtrl.getMaterialPriceHistory);
materialRoutes.get("/price-trend/:id", priceCtrl.getPriceTrend);

// Dynamic ID routes MUST be at the bottom to prevent shadowing
materialRoutes.get("/:id", materialCtrl.getMaterialById);

