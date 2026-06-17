/**
 * Master data routes — thin wiring to MetalController and GradeController.
 * All CRUD for metals, grades, raw materials, suppliers, prices, and alloys.
 */

import { Router } from "express";
import { allowRoles } from "../middleware/auth.js";
import * as metalCtrl from "../controllers/metal.controller.js";
import * as gradeCtrl from "../controllers/grade.controller.js";

export const masterRoutes = Router();

// ── Metals ────────────────────────────────────────────────────────────────────
masterRoutes.get("/metals", metalCtrl.listMetals);
masterRoutes.post("/metals", allowRoles("COSTING_DEPARTMENT"), metalCtrl.createMetal);
masterRoutes.put("/metals/:id", allowRoles("COSTING_DEPARTMENT"), metalCtrl.updateMetal);
masterRoutes.delete("/metals/:id", allowRoles("COSTING_DEPARTMENT"), metalCtrl.deactivateMetal);

// ── Grades ────────────────────────────────────────────────────────────────────
masterRoutes.get("/grades", gradeCtrl.listGrades);
masterRoutes.post("/grades", allowRoles("COSTING_DEPARTMENT"), gradeCtrl.createGrade);
masterRoutes.put("/grades/:id", allowRoles("COSTING_DEPARTMENT"), gradeCtrl.updateGrade);
masterRoutes.delete("/grades/:id", allowRoles("COSTING_DEPARTMENT"), gradeCtrl.deactivateGrade);

// ── Raw Materials ─────────────────────────────────────────────────────────────
masterRoutes.get("/raw-materials", metalCtrl.listRawMaterials);
masterRoutes.post("/raw-materials", allowRoles("COSTING_DEPARTMENT"), metalCtrl.createRawMaterial);
masterRoutes.put("/raw-materials/:id", allowRoles("COSTING_DEPARTMENT"), metalCtrl.updateRawMaterial);
masterRoutes.delete("/raw-materials/:id", allowRoles("COSTING_DEPARTMENT"), metalCtrl.deactivateRawMaterial);

// ── Suppliers ─────────────────────────────────────────────────────────────────
masterRoutes.get("/suppliers", metalCtrl.listSuppliers);
masterRoutes.post("/suppliers", allowRoles("COSTING_DEPARTMENT"), metalCtrl.createSupplier);
masterRoutes.put("/suppliers/:id", allowRoles("COSTING_DEPARTMENT"), metalCtrl.updateSupplier);
masterRoutes.delete("/suppliers/:id", allowRoles("COSTING_DEPARTMENT"), metalCtrl.deactivateSupplier);

// ── Price List ────────────────────────────────────────────────────────────────
masterRoutes.get("/prices", metalCtrl.listPrices);
masterRoutes.post("/prices", allowRoles("COSTING_DEPARTMENT"), metalCtrl.createPrice);
masterRoutes.put("/prices/:id", allowRoles("COSTING_DEPARTMENT"), metalCtrl.updatePrice);
masterRoutes.delete("/prices/:id", allowRoles("COSTING_DEPARTMENT"), metalCtrl.deactivatePrice);
masterRoutes.get("/price-history", metalCtrl.listPriceHistory);

// ── Alloys ────────────────────────────────────────────────────────────────────
masterRoutes.get("/alloys", metalCtrl.listAlloys);
masterRoutes.post("/alloys", allowRoles("COSTING_DEPARTMENT", "PDQC"), metalCtrl.createAlloy);
masterRoutes.put("/alloys/:id", allowRoles("COSTING_DEPARTMENT", "PDQC"), metalCtrl.updateAlloy);
masterRoutes.delete("/alloys/:id", allowRoles("COSTING_DEPARTMENT"), metalCtrl.deactivateAlloy);
