import type { Request } from "express";

export type SortDirection = "asc" | "desc";

export function tableSort(
  query: Request["query"],
  allowedFields: readonly string[],
  fallbackField: string,
  fallbackDirection: SortDirection = "asc"
) {
  const requestedField = String(query.sortBy ?? fallbackField);
  const sortBy = allowedFields.includes(requestedField) ? requestedField : fallbackField;
  const requestedDirection = String(query.sortDir ?? fallbackDirection).toLowerCase();
  const sortDir: SortDirection = requestedDirection === "desc" ? "desc" : "asc";

  return {
    sortBy,
    sortDir,
    orderBy: { [sortBy]: sortDir } as Record<string, SortDirection>
  };
}

export function exportLimit(query: Request["query"], max = 5000) {
  const requested = Number(query.limit ?? max);
  if (!Number.isFinite(requested)) return max;
  return Math.min(Math.max(Math.floor(requested), 1), max);
}

export function idFilter(query: Request["query"]) {
  const raw = String(query.ids ?? "").trim();
  if (!raw) return undefined;
  const values = raw.split(",").map((value) => value.trim()).filter(Boolean);
  return values.length ? values : undefined;
}
