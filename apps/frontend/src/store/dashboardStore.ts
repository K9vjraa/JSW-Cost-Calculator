import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface DashboardFilters {
  timeframe: "7d" | "30d" | "90d" | "1y" | "all";
  category: string;
  searchQuery: string;
}

export interface DashboardState {
  filters: DashboardFilters;
  refreshTrigger: number;
  setFilters: (filters: Partial<DashboardFilters>) => void;
  resetFilters: () => void;
  triggerRefresh: () => void;
}

const defaultFilters: DashboardFilters = {
  timeframe: "30d",
  category: "all",
  searchQuery: ""
};

// ── Persistent Dashboard Client Settings Store ──────────────────────────────────
export const useDashboardStore = create<DashboardState>()(
  persist(
    (set) => ({
      filters: defaultFilters,
      refreshTrigger: 0,

      setFilters: (nextFilters) =>
        set((state) => ({
          filters: { ...state.filters, ...nextFilters }
        })),

      resetFilters: () => set({ filters: defaultFilters }),

      triggerRefresh: () => set((state) => ({ refreshTrigger: state.refreshTrigger + 1 }))
    }),
    {
      name: "mcms-dashboard-storage",
      storage: createJSONStorage(() => localStorage), // Persist filter choices in localStorage
      partialize: (state) => ({ filters: state.filters }) // Only persist filter states
    }
  )
);

export default useDashboardStore;
