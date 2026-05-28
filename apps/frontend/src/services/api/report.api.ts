import { useQuery } from "@tanstack/react-query";
import { apiClient } from "./client";

export interface ReportFilters {
  range?: string;
  from?: string;
  to?: string;
}

// ── Master API Endpoints ──────────────────────────────────────────────────────
export const reportApi = {
  getCostSummary: async (filters?: ReportFilters): Promise<unknown> => {
    const { data } = await apiClient.get("/analytics/cost-summary", { params: filters });
    return data;
  },

  getTrends: async (filters?: ReportFilters): Promise<unknown> => {
    const { data } = await apiClient.get("/analytics/trends", { params: filters });
    return data;
  },

  getTopAlloys: async (filters?: ReportFilters): Promise<unknown> => {
    const { data } = await apiClient.get("/analytics/top-alloys", { params: filters });
    return data;
  },

  triggerExport: async (calculationId: string, format: "pdf" | "csv"): Promise<Blob> => {
    const { data } = await apiClient.get(`/exports/calculation/${calculationId}`, {
      params: { format },
      responseType: "blob" // Handle binary data safely
    });
    return data;
  }
};

// ── TanStack Query Hooks ──────────────────────────────────────────────────────
export function useCostSummaryQuery(filters?: ReportFilters) {
  return useQuery({
    queryKey: ["reports", "cost-summary", filters ?? {}],
    queryFn: () => reportApi.getCostSummary(filters),
    staleTime: 60 * 1000, // 1 minute analytics cache
    retry: 1
  });
}

export function useTrendsQuery(filters?: ReportFilters) {
  return useQuery({
    queryKey: ["reports", "trends", filters ?? {}],
    queryFn: () => reportApi.getTrends(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes trends cache
    retry: 1
  });
}

export function useTopAlloysQuery(filters?: ReportFilters) {
  return useQuery({
    queryKey: ["reports", "top-alloys", filters ?? {}],
    queryFn: () => reportApi.getTopAlloys(filters),
    staleTime: 2 * 60 * 1000,
    retry: 1
  });
}
