/**
 * Audit log routes — thin wiring to AuditController.
 */

import { Router } from "express";
import { allowRoles } from "../middleware/auth.js";
import * as ctrl from "../controllers/audit.controller.js";

export const auditRoutes = Router();

auditRoutes.get("/", allowRoles("COSTING_DEPARTMENT"), ctrl.listLogs);
