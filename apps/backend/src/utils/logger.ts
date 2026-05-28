/**
 * Structured Logger — JSW MCMS
 * 
 * Lightweight production-grade logger with:
 * - Log levels controlled by LOG_LEVEL env var
 * - JSON output in production (for log aggregators like Papertrail, Datadog, Railway Logs)
 * - Colorized pretty-print in development
 * - Request ID context support
 */
import { env } from "../config/env.js";

type LogLevel = "error" | "warn" | "info" | "http" | "debug";

const LEVELS: Record<LogLevel, number> = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const COLORS: Record<LogLevel, string> = {
  error: "\x1b[31m", // red
  warn: "\x1b[33m",  // yellow
  info: "\x1b[36m",  // cyan
  http: "\x1b[35m",  // magenta
  debug: "\x1b[32m", // green
};

const RESET = "\x1b[0m";
const currentLevel = LEVELS[env.logLevel as LogLevel] ?? LEVELS.info;

function shouldLog(level: LogLevel): boolean {
  return LEVELS[level] <= currentLevel;
}

function formatMessage(
  level: LogLevel,
  message: string,
  meta?: Record<string, unknown>
): string {
  const ts = new Date().toISOString();

  if (env.isProduction) {
    // JSON format for production log aggregation
    return JSON.stringify({
      timestamp: ts,
      level,
      service: "mcms-api",
      message,
      ...meta,
    });
  }

  // Pretty format for local development
  const color = COLORS[level] || "";
  const metaStr = meta ? ` ${JSON.stringify(meta)}` : "";
  return `${color}[${level.toUpperCase()}]${RESET} ${ts} — ${message}${metaStr}`;
}

function write(level: LogLevel, message: string, meta?: Record<string, unknown>) {
  if (!shouldLog(level)) return;
  const line = formatMessage(level, message, meta);
  if (level === "error") {
    process.stderr.write(line + "\n");
  } else {
    process.stdout.write(line + "\n");
  }
}

export const logger = {
  error: (message: string, meta?: Record<string, unknown>) => write("error", message, meta),
  warn: (message: string, meta?: Record<string, unknown>) => write("warn", message, meta),
  info: (message: string, meta?: Record<string, unknown>) => write("info", message, meta),
  http: (message: string, meta?: Record<string, unknown>) => write("http", message, meta),
  debug: (message: string, meta?: Record<string, unknown>) => write("debug", message, meta),

  /** Log an incoming HTTP request (method, url, status, ms) */
  request: (method: string, url: string, status: number, ms: number, userId?: string) => {
    write("http", `${method} ${url}`, {
      status,
      duration_ms: ms,
      ...(userId ? { userId } : {}),
    });
  },
};
