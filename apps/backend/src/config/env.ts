/**
 * Environment Configuration & Validation
 * 
 * Uses Zod to validate all required env vars at startup.
 * In production, missing or invalid variables cause an immediate fatal exit
 * rather than silent runtime failures.
 */
import { z } from "zod";

// ── Schema ─────────────────────────────────────────────────────────────────
const envSchema = z.object({
  // Server
  PORT: z.coerce.number().int().min(1).max(65535).default(4000),
  NODE_ENV: z.enum(["development", "test", "staging", "production"]).default("development"),

  // Database — required in production
  DATABASE_URL: z
    .string()
    .url("DATABASE_URL must be a valid PostgreSQL connection string")
    .refine((url) => url.startsWith("postgresql://") || url.startsWith("postgres://"), {
      message: "DATABASE_URL must start with postgresql:// or postgres://"
    }),

  // JWT — required always; enforce minimum length in production
  JWT_ACCESS_SECRET: z
    .string()
    .min(16, "JWT_ACCESS_SECRET must be at least 16 characters"),
  JWT_REFRESH_SECRET: z
    .string()
    .min(16, "JWT_REFRESH_SECRET must be at least 16 characters"),

  // Token TTLs
  ACCESS_TOKEN_TTL: z.string().default("15m"),
  REFRESH_TOKEN_TTL_DAYS: z.coerce.number().int().min(1).max(90).default(7),

  // CORS
  CLIENT_ORIGIN: z.string().url("CLIENT_ORIGIN must be a valid URL").default("http://localhost:5173"),

  // Logging
  LOG_LEVEL: z.enum(["error", "warn", "info", "http", "debug"]).default("info"),

  // Supabase
  SUPABASE_URL: z.string().url("SUPABASE_URL must be a valid URL"),
  SUPABASE_ANON_KEY: z.string().min(1, "SUPABASE_ANON_KEY is required"),
});

// ── Parse & validate ────────────────────────────────────────────────────────
const _parsed = envSchema.safeParse(process.env);

if (!_parsed.success) {
  const errors = _parsed.error.issues
    .map((issue) => `  [${issue.path.join(".")}] ${issue.message}`)
    .join("\n");

  console.error("╔══════════════════════════════════════════════════════╗");
  console.error("║   MCMS API — Environment Validation FAILED           ║");
  console.error("╠══════════════════════════════════════════════════════╣");
  console.error("║  Fix these environment variables before starting:    ║");
  console.error("╚══════════════════════════════════════════════════════╝");
  console.error(errors);
  console.error("\n💡 Tip: Copy .env.example → .env and fill in the values.");
  process.exit(1);
}

const _env = _parsed.data;

// ── Warn about insecure defaults in production ──────────────────────────────
if (_env.NODE_ENV === "production") {
  const insecureDefaults = [
    ["JWT_ACCESS_SECRET", _env.JWT_ACCESS_SECRET.includes("development")],
    ["JWT_REFRESH_SECRET", _env.JWT_REFRESH_SECRET.includes("development")],
    ["DATABASE_URL", _env.DATABASE_URL.includes("localhost")],
  ];

  const warnings = insecureDefaults.filter(([, isInsecure]) => isInsecure);
  if (warnings.length > 0) {
    const names = warnings.map(([name]) => name).join(", ");
    console.warn(`⚠️  SECURITY WARNING: Insecure defaults detected in production for: ${names}`);
  }

  if (_env.CLIENT_ORIGIN === "http://localhost:5173") {
    console.warn("⚠️  CLIENT_ORIGIN is still localhost — set your production Vercel URL.");
  }
}

// ── Export typed env object ─────────────────────────────────────────────────
export const env = {
  port: _env.PORT,
  nodeEnv: _env.NODE_ENV,
  isProduction: _env.NODE_ENV === "production",
  isDevelopment: _env.NODE_ENV === "development",
  databaseUrl: _env.DATABASE_URL,
  clientOrigin: _env.CLIENT_ORIGIN,
  accessSecret: _env.JWT_ACCESS_SECRET,
  refreshSecret: _env.JWT_REFRESH_SECRET,
  accessTokenTtl: _env.ACCESS_TOKEN_TTL,
  refreshTokenTtlDays: _env.REFRESH_TOKEN_TTL_DAYS,
  logLevel: _env.LOG_LEVEL,
  supabaseUrl: _env.SUPABASE_URL,
  supabaseAnonKey: _env.SUPABASE_ANON_KEY,
} as const;
