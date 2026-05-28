import type { Request, Response, NextFunction } from "express";
import { audit } from "../services/audit.js";

export function auditMiddleware(req: Request, res: Response, next: NextFunction) {
  const ipAddress = (req.headers["x-forwarded-for"] as string) || req.ip || req.socket.remoteAddress;

  res.on("finish", () => {
    // Only log write/mutation operations (POST, PUT, DELETE, PATCH)
    if (["POST", "PUT", "DELETE", "PATCH"].includes(req.method) && req.actor) {
      const url = req.originalUrl;

      // Exclude generic routes if any to avoid double logging or noise
      if (url.includes("/api/auth/login") || url.includes("/api/auth/refresh") || url.includes("/api/auth/logout")) {
        return; // Handled manually inside route handlers to capture login details safely
      }

      // Determine entity class and action
      const urlParts = url.split("?")[0].split("/");
      // E.g., /api/calculations -> calculations, /api/masters/metals -> metals
      // If parts[1] === "api", then parts[2] is the primary entity namespace
      const rawEntity = urlParts[2] || "System";
      
      let entity = rawEntity;
      let entityId: string | undefined = undefined;

      // Special cases
      if (rawEntity === "masters" && urlParts[3]) {
        entity = urlParts[3]; // e.g. /api/masters/metals -> metals
        entityId = urlParts[4] || undefined;
      } else {
        entityId = (req.params?.id as string | undefined) || urlParts[3] || undefined;
      }

      // Standardize entity names to capital singular or general category
      entity = entity.replace(/-./g, x => x[1].toUpperCase()); // camelCase
      entity = entity.charAt(0).toUpperCase() + entity.slice(1); // TitleCase
      if (entity.endsWith("s") && entity !== "Alloys" && entity !== "Settings" && entity !== "Prices") {
        entity = entity.slice(0, -1); // Singularize roughly
      }

      let action = "UNKNOWN";
      if (req.method === "POST") action = "CREATE";
      else if (req.method === "PUT" || req.method === "PATCH") action = "UPDATE";
      else if (req.method === "DELETE") action = "DEACTIVATE";

      // Scrub sensitive payload fields like password
      const scrubbedBody = req.body ? { ...req.body } : {};
      if (scrubbedBody.password) delete scrubbedBody.password;
      if (scrubbedBody.passwordHash) delete scrubbedBody.passwordHash;

      // Log the event asynchronously
      audit({
        userId: req.actor.id,
        action: `${action}_AUTO`,
        entity,
        entityId: entityId || undefined,
        ipAddress: (typeof ipAddress === "string" ? ipAddress : undefined) || undefined,
        details: {
          path: url,
          method: req.method,
          statusCode: res.statusCode,
          payload: scrubbedBody
        }
      }).catch((err) => {
        console.error("Middleware failed to log audit event asynchronously", err);
      });
    }
  });

  next();
}
