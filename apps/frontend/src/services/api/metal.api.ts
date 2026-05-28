import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "./client";
import type { Metal } from "@/types";

export interface CreateMetalPayload {
  name: string;
  code: string;
  category: string;
  unit?: string;
  description?: string;
}

// ── Master API Endpoints ──────────────────────────────────────────────────────
export const metalApi = {
  getMetals: async (search?: string): Promise<Metal[]> => {
    const { data } = await apiClient.get<{ data: Metal[] }>("/metals", {
      params: { search, limit: 100 }
    });
    return data.data;
  },

  createMetal: async (payload: CreateMetalPayload): Promise<Metal> => {
    const { data } = await apiClient.post<Metal>("/metals", payload);
    return data;
  },

  getPrices: async (metalId?: string): Promise<unknown[]> => {
    const { data } = await apiClient.get<{ data: unknown[] }>("/prices", {
      params: { metalId, limit: 100 }
    });
    return data.data;
  }
};

// ── TanStack Query Hooks ──────────────────────────────────────────────────────
export function useMetalsQuery(search?: string) {
  return useQuery({
    queryKey: ["metals", search ?? ""],
    queryFn: () => metalApi.getMetals(search),
    staleTime: 5 * 60 * 1000, // 5 minutes standard master data cache
    placeholderData: (previousData) => previousData,
    retry: 2 // automatic query retry handling
  });
}

export function usePricesQuery(metalId?: string) {
  return useQuery({
    queryKey: ["prices", metalId ?? "all"],
    queryFn: () => metalApi.getPrices(metalId),
    staleTime: 3 * 60 * 1000, // 3 minutes standard LME prices cache
    enabled: !!metalId,
    retry: 2
  });
}

export function useCreateMetalMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: metalApi.createMetal,
    onSuccess: () => {
      // Invalidate metal list and dashboard summaries upon new creation
      queryClient.invalidateQueries({ queryKey: ["metals"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    }
  });
}
