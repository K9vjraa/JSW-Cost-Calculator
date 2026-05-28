/**
 * JSW Metal Cost Management System (MCMS) Shared Configuration System
 */

export const DEFAULT_GST_PERCENT = 18;

export const SYSTEM_ROLES = ["ADMIN", "EMPLOYEE", "USER"] as const;

export const METALLURGY_TOLERANCE_PCT = 0.1; // Floating point metallurgical balance tolerance

export const API_CONFIG = {
  timeoutMs: 10000,
  retryAttempts: 3,
  retryDelayMs: 1500
};
