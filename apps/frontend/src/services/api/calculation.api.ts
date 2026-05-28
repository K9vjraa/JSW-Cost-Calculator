import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "./client";
import type { Calculation } from "@/types";

export interface CalculationItemPayload {
  metalId?: string | null;
  rawMaterialId?: string | null;
  gradeId?: string | null;
  quantity: number;
  compositionPct?: number | null;
}

export interface CalculationPayload {
  name: string;
  mode: "metal" | "alloy" | "raw-material";
  alloyId?: string | null;
  items: CalculationItemPayload[];
}

// ── Master API Endpoints ──────────────────────────────────────────────────────
export const calculationApi = {
  getCalculations: async (): Promise<Calculation[]> => {
    const { data } = await apiClient.get<{ data: Calculation[] }>("/calculations", {
      params: { limit: 50 }
    });
    return data.data;
  },

  getCalculation: async (id: string): Promise<Calculation> => {
    const { data } = await apiClient.get<Calculation>(`/calculations/${id}`);
    return data;
  },

  previewCalculation: async (payload: CalculationPayload): Promise<unknown> => {
    const { data } = await apiClient.post("/calculations/preview", payload);
    return data;
  },

  createCalculation: async (payload: CalculationPayload): Promise<Calculation> => {
    const { data } = await apiClient.post<Calculation>("/calculations", payload);
    return data;
  },

  completeCalculation: async (id: string): Promise<Calculation> => {
    const { data } = await apiClient.post<Calculation>(`/calculations/${id}/complete`);
    return data;
  },

  deleteCalculation: async (id: string): Promise<void> => {
    await apiClient.delete(`/calculations/${id}`);
  }
};

// ── TanStack Query Hooks ──────────────────────────────────────────────────────
export function useCalculationsQuery() {
  return useQuery({
    queryKey: ["calculations"],
    queryFn: calculationApi.getCalculations,
    staleTime: 30_000,
    retry: 2
  });
}

export function useCalculationQuery(id: string) {
  return useQuery({
    queryKey: ["calculations", id],
    queryFn: () => calculationApi.getCalculation(id),
    staleTime: 60_000,
    enabled: !!id,
    retry: 2
  });
}

export function useCreateCalculationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: calculationApi.createCalculation,
    onSuccess: (newCalc) => {
      // Optimistic-like insertion: directly update cache with new calculation draft
      queryClient.setQueryData<Calculation[]>(["calculations"], (old) => {
        return old ? [newCalc, ...old] : [newCalc];
      });
      queryClient.invalidateQueries({ queryKey: ["calculations"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    }
  });
}

export function useCompleteCalculationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: calculationApi.completeCalculation,
    
    // ── Optimistic Update Configuration ──────────────────────────────────────
    onMutate: async (id) => {
      // Cancel outgoing refetches to prevent overwriting optimistic state
      await queryClient.cancelQueries({ queryKey: ["calculations"] });
      await queryClient.cancelQueries({ queryKey: ["calculations", id] });

      // Snapshot current cache values
      const previousList = queryClient.getQueryData<Calculation[]>(["calculations"]);
      const previousItem = queryClient.getQueryData<Calculation>(["calculations", id]);

      // Optimistically update list cache
      queryClient.setQueryData<Calculation[]>(["calculations"], (old) => {
        return old?.map((calc) =>
          calc.id === id ? { ...calc, status: "COMPLETED" } : calc
        );
      });

      // Optimistically update item cache
      if (previousItem) {
        queryClient.setQueryData<Calculation>(["calculations", id], {
          ...previousItem,
          status: "COMPLETED"
        });
      }

      // Return snapshots for rollbacks
      return { previousList, previousItem };
    },

    onError: (_err, id, context) => {
      // Rollback to snapshotted state on API error failures
      if (context?.previousList) {
        queryClient.setQueryData(["calculations"], context.previousList);
      }
      if (context?.previousItem) {
        queryClient.setQueryData(["calculations", id], context.previousItem);
      }
    },

    onSettled: (_data, _err, id) => {
      // Trigger stale invalidation to align state with backend
      queryClient.invalidateQueries({ queryKey: ["calculations"] });
      queryClient.invalidateQueries({ queryKey: ["calculations", id] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    }
  });
}

export function useDeleteCalculationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: calculationApi.deleteCalculation,
    
    // ── Optimistic Delete Configuration ──────────────────────────────────────
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["calculations"] });
      const previousList = queryClient.getQueryData<Calculation[]>(["calculations"]);

      // Optimistically filter deleted item from workspace drafts cache list
      queryClient.setQueryData<Calculation[]>(["calculations"], (old) => {
        return old?.filter((calc) => calc.id !== id);
      });

      return { previousList };
    },

    onError: (_err, _id, context) => {
      if (context?.previousList) {
        queryClient.setQueryData(["calculations"], context.previousList);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["calculations"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    }
  });
}
