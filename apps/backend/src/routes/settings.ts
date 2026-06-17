/**
 * Settings routes — thin wiring to SettingsController.
 */

import { Router } from "express";
import { allowRoles } from "../middleware/auth.js";
import * as ctrl from "../controllers/settings.controller.js";

export const settingsRoutes = Router();

// ── System Settings ───────────────────────────────────────────────────────────
settingsRoutes.get("/", ctrl.listSettings);
settingsRoutes.get("/:key", ctrl.getSetting);
settingsRoutes.put("/", allowRoles("COSTING_DEPARTMENT"), ctrl.bulkUpdateSettings);
settingsRoutes.put("/:key", allowRoles("COSTING_DEPARTMENT"), ctrl.updateSetting);

// ── GST Slabs ─────────────────────────────────────────────────────────────────
settingsRoutes.get("/gst/slabs", ctrl.listGstSlabs);
settingsRoutes.post("/gst/slabs", allowRoles("COSTING_DEPARTMENT"), ctrl.createGstSlab);
settingsRoutes.put("/gst/slabs/:id", allowRoles("COSTING_DEPARTMENT"), ctrl.updateGstSlab);
settingsRoutes.delete("/gst/slabs/:id", allowRoles("COSTING_DEPARTMENT"), ctrl.deactivateGstSlab);
