import { Router } from "express";
import { allowRoles } from "../middleware/auth.js";
import * as importCtrl from "../controllers/import.controller.js";

export const importRoutes = Router();

// Restricted to ADMIN roles for master imports
importRoutes.post("/metals", allowRoles("COSTING_DEPARTMENT"), importCtrl.importMetals);
importRoutes.post("/grades", allowRoles("COSTING_DEPARTMENT"), importCtrl.importGrades);
importRoutes.post("/prices", allowRoles("COSTING_DEPARTMENT"), importCtrl.importPrices);
importRoutes.post("/all", allowRoles("COSTING_DEPARTMENT"), importCtrl.importAll);

// Open for calculations dropdowns loading
importRoutes.get("/catalog", importCtrl.getCatalog);
