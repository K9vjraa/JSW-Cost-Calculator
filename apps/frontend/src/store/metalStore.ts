import { create } from "zustand";
import type { Metal } from "@/types";
import { metalApi } from "../services/api/metal.api";

export interface MetalState {
  metals: Metal[];
  isLoading: boolean;
  error: string | null;
  setMetals: (metals: Metal[]) => void;
  fetchMetals: (search?: string) => Promise<void>;
  addMetal: (metal: Metal) => void;
  clearError: () => void;
}

export const useMetalStore = create<MetalState>((set) => ({
  metals: [],
  isLoading: false,
  error: null,

  setMetals: (metals) => set({ metals }),

  fetchMetals: async (search?: string) => {
    set({ isLoading: true, error: null });
    try {
      const data = await metalApi.getMetals(search);
      set({ metals: data, isLoading: false });
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Failed to fetch metals";
      set({ error: errMsg, isLoading: false });
    }
  },

  addMetal: (metal) =>
    set((state) => ({
      metals: [...state.metals, metal],
    })),

  clearError: () => set({ error: null }),
}));

export default useMetalStore;
