import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "./client";
import type { Grade } from "@/types";

export interface CreateGradePayload {
  metalId: string;
  name: string;
  subGrade?: string | null;
  multiplier: number;
  extraPrice?: number;
  mechanicalProperties?: Record<string, string>;
  chemicalComposition?: Record<string, string>;
}

// ── Master API Endpoints ──────────────────────────────────────────────────────
export const gradeApi = {
  getGrades: async (metalId?: string): Promise<Grade[]> => {
    const { data } = await apiClient.get<{ data: Grade[] }>("/grades", {
      params: { metalId, limit: 100 }
    });
    return data.data;
  },

  getAllGrades: async (): Promise<Grade[]> => {
    const { data } = await apiClient.get<{ data: Grade[] }>("/grades", {
      params: { limit: 200 }
    });
    return data.data;
  },

  createGrade: async (payload: CreateGradePayload): Promise<Grade> => {
    const { data } = await apiClient.post<Grade>("/grades", payload);
    return data;
  }
};

// ── TanStack Query Hooks ──────────────────────────────────────────────────────
export function useGradesQuery(metalId?: string) {
  return useQuery({
    queryKey: ["grades", metalId ?? "all"],
    queryFn: () => gradeApi.getGrades(metalId),
    staleTime: 5 * 60 * 1000, // 5 minutes standard grade data cache
    enabled: !!metalId,
    retry: 2
  });
}

export function useAllGradesQuery() {
  return useQuery({
    queryKey: ["grades", "all-master"],
    queryFn: gradeApi.getAllGrades,
    staleTime: 5 * 60 * 1000,
    retry: 2
  });
}

export function useCreateGradeMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: gradeApi.createGrade,
    onSuccess: () => {
      // Invalidate grades caches upon new grade entry creation
      queryClient.invalidateQueries({ queryKey: ["grades"] });
    }
  });
}
