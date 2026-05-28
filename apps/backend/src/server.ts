import { createServer } from "./app.js";
import { env } from "./config/env.js";
import { logger } from "./utils/logger.js";

const app = createServer();

app.listen(env.port, () => {
  logger.info(`MCMS API started`, {
    env: env.nodeEnv,
    port: env.port,
    url: `http://localhost:${env.port}`,
    pid: process.pid,
  });
});

// Graceful shutdown handlers
process.on("SIGTERM", () => {
  logger.info("SIGTERM received — shutting down gracefully");
  process.exit(0);
});

process.on("SIGINT", () => {
  logger.info("SIGINT received — shutting down");
  process.exit(0);
});

process.on("uncaughtException", (err) => {
  logger.error("Uncaught exception", { error: err.message, stack: err.stack });
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  logger.error("Unhandled promise rejection", { reason: String(reason) });
  process.exit(1);
});

