import { apiClient } from "./client";
import type { ComparisonSession, ComparisonResultDTO } from "@jsw-mcms/types";
import type { AxiosRequestConfig } from "axios";

export const ComparisonApi = {
  /**
   * Creates a new temporary or persisted comparison session.
   */
  async createSession(
    data: { name: string; description: string; items: { gradeId: string; position: number; colorCode: string }[] },
    config?: AxiosRequestConfig
  ): Promise<ComparisonSession> {
    const response = await apiClient.post<{ data: ComparisonSession }>("/comparisons", data, config);
    return response.data.data;
  },

  /**
   * Fetches the complex engine results for a given comparison session.
   */
  async getResults(id: string, config?: AxiosRequestConfig): Promise<ComparisonResultDTO> {
    const response = await apiClient.get<{ data: ComparisonResultDTO }>(`/comparisons/${id}/results`, config);
    return response.data.data;
  }
};
