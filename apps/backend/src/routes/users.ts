/**
 * User management routes — thin wiring to UserController.
 * ADMIN-only via middleware applied at app.ts level.
 */

import { Router } from "express";
import { allowRoles } from "../middleware/auth.js";
import * as ctrl from "../controllers/user.controller.js";

export const userRoutes = Router();
userRoutes.use(allowRoles("COSTING_DEPARTMENT"));

userRoutes.get("/", ctrl.listUsers);
userRoutes.post("/", ctrl.createUser);
userRoutes.put("/:id", ctrl.updateUser);
userRoutes.delete("/:id", ctrl.deactivateUser);
