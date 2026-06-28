import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ComparisonApi } from "../services/api/comparison.api";
import { toast } from "sonner";
import { AxiosError } from "axios";
import type { ComparisonResultDTO, ComparisonSession } from "@jsw-mcms/types";

// Query keys
export const comparisonKeys = {
  all: ["comparisons"] as const,
  results: (id: string | null) => [...comparisonKeys.all, "results", id] as const,
};

export function useComparisonResults(sessionId: string | null) {
  return useQuery<ComparisonResultDTO, AxiosError>({
    queryKey: comparisonKeys.results(sessionId),
    queryFn: async ({ signal }) => {
      if (!sessionId) throw new Error("Session ID is required");
      return await ComparisonApi.getResults(sessionId, { signal });
    },
    enabled: !!sessionId,
    retry: 2, // Retry logic
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes (aligns with backend)
  });
}

export function useCreateComparisonSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { name: string; description: string; items: { gradeId: string; position: number; colorCode: string }[] }) => {
      return await ComparisonApi.createSession(data);
    },
    onMutate: async (newSessionData) => {
      // Optimistic Updates could go here if we had a list of sessions
      await queryClient.cancelQueries({ queryKey: comparisonKeys.all });
    },
    onSuccess: (data) => {
      // Invalidate existing sessions list or related data
      queryClient.invalidateQueries({ queryKey: comparisonKeys.all });
    },
    onError: (error) => {
      toast.error("Failed to generate comparison matrix.");
      console.error(error);
    },
  });
}
