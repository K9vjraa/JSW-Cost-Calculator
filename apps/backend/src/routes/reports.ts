/**
 * Report routes — thin wiring to ReportController.
 */

import { Router } from "express";
import { allowRoles } from "../middleware/auth.js";
import * as ctrl from "../controllers/report.controller.js";

export const reportRoutes = Router();

// ── CRUD ──────────────────────────────────────────────────────────────────────
reportRoutes.get("/", ctrl.listReports);
reportRoutes.get("/:id", ctrl.getReport);
reportRoutes.post("/", allowRoles("COSTING_DEPARTMENT", "PDQC"), ctrl.createReport);
reportRoutes.delete("/:id", allowRoles("COSTING_DEPARTMENT", "PDQC"), ctrl.deleteReport);

// ── Analytics ─────────────────────────────────────────────────────────────────
reportRoutes.get("/analytics/cost-summary", ctrl.costSummary);
reportRoutes.get("/analytics/trends", ctrl.trends);
reportRoutes.get("/analytics/comparison", ctrl.comparison);
reportRoutes.get("/analytics/status-breakdown", ctrl.statusBreakdown);
reportRoutes.get("/analytics/top-alloys", ctrl.topAlloys);
reportRoutes.get("/analytics/price-history", allowRoles("COSTING_DEPARTMENT", "PDQC"), ctrl.priceHistory);
