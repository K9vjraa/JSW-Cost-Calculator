import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { env } from "./config/env.js";
import { errorHandler } from "./utils/http.js";
import { authenticate } from "./middleware/auth.js";
import { auditMiddleware } from "./middleware/audit.js";
import { auditRoutes } from "./routes/audit.js";
import { authRoutes } from "./routes/auth.js";
import { calculationRoutes } from "./routes/calculations.js";
import { comparisonRoutes } from "./routes/comparisons.js";
import { dashboardRoutes } from "./routes/dashboard.js";
import { exportRoutes } from "./routes/exports.js";
import { masterRoutes } from "./routes/masters.js";
import { notificationRoutes } from "./routes/notifications.js";
import { reportRoutes } from "./routes/reports.js";
import { userRoutes } from "./routes/users.js";
import { settingsRoutes } from "./routes/settings.js";

export function createServer() {
  const app = express();
  app.disable("x-powered-by");
  app.use(helmet({ crossOriginResourcePolicy: false }));
  app.use(cors({ origin: env.clientOrigin, credentials: true }));
  app.use(cookieParser());
  app.use(express.json({ limit: "1mb" }));
  app.use(
    "/api/auth/login",
    rateLimit({ windowMs: 60_000, limit: 10, standardHeaders: true, legacyHeaders: false })
  );

  app.get("/api/health", (_req, res) => res.json({ status: "ok", service: "mcms-api" }));
  app.use("/api/auth", authRoutes);
  app.use("/api/dashboard", authenticate, auditMiddleware, dashboardRoutes);
  app.use("/api", authenticate, auditMiddleware, masterRoutes);
  app.use("/api/calculations", authenticate, auditMiddleware, calculationRoutes);
  app.use("/api/comparisons", authenticate, auditMiddleware, comparisonRoutes);
  app.use("/api/reports", authenticate, auditMiddleware, reportRoutes);
  app.use("/api/exports", authenticate, auditMiddleware, exportRoutes);
  app.use("/api/audit-logs", authenticate, auditMiddleware, auditRoutes);
  app.use("/api/notifications", authenticate, auditMiddleware, notificationRoutes);
  app.use("/api/users", authenticate, auditMiddleware, userRoutes);
  app.use("/api/settings", authenticate, auditMiddleware, settingsRoutes);
  app.use(errorHandler);
  return app;
}
