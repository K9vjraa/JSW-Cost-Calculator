import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { ComparisonSession } from "@jsw-mcms/types";

export interface ComparisonStoreState {
  // Grades Selection
  selectedGradeIds: string[];
  referenceGradeId: string | null;

  // Filters & Sorting
  searchQuery: string;
  filterCategory: string;
  filterBaseMetal: string;
  sortBy: "default" | "name-asc" | "cost-asc" | "cost-desc";
  orderQuantity: number;

  // Toolbar & UI State
  isFullScreen: boolean;
  highlightDiffs: boolean;
  collapsedGroups: Record<string, boolean>;

  // Session & Backend State
  sessionId: string | null;
  exportStatus: "idle" | "exporting" | "success" | "error";
  recentComparisons: ComparisonSession[];

  // Actions
  setSelectedGradeIds: (ids: string[]) => void;
  toggleGradeSelection: (id: string) => void;
  setReferenceGradeId: (id: string | null) => void;
  
  setSearchQuery: (query: string) => void;
  setFilterCategory: (category: string) => void;
  setFilterBaseMetal: (metal: string) => void;
  setSortBy: (sort: "default" | "name-asc" | "cost-asc" | "cost-desc") => void;
  setOrderQuantity: (qty: number) => void;

  setIsFullScreen: (isFull: boolean) => void;
  setHighlightDiffs: (highlight: boolean) => void;
  setCollapsedGroups: (groups: Record<string, boolean>) => void;
  toggleGroup: (group: string) => void;

  setSessionId: (id: string | null) => void;
  setExportStatus: (status: "idle" | "exporting" | "success" | "error") => void;
  addRecentComparison: (session: ComparisonSession) => void;

  resetState: () => void;
}

const initialState = {
  selectedGradeIds: [],
  referenceGradeId: null,
  searchQuery: "",
  filterCategory: "all",
  filterBaseMetal: "all",
  sortBy: "default" as const,
  orderQuantity: 1000,
  isFullScreen: false,
  highlightDiffs: true,
  collapsedGroups: {
    cost: false,
    mechanical: false,
    chemical: false,
    tolerances: false,
    bend: false,
  },
  sessionId: null,
  exportStatus: "idle" as const,
  recentComparisons: [],
};

export const useComparisonStore = create<ComparisonStoreState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setSelectedGradeIds: (ids) => set({ selectedGradeIds: ids, sessionId: null }),
      toggleGradeSelection: (id) => {
        const { selectedGradeIds } = get();
        const isSelected = selectedGradeIds.includes(id);
        
        if (!isSelected && selectedGradeIds.length >= 8) {
          alert("You can compare up to 8 grades at a time.");
          return;
        }

        const nextIds = isSelected
          ? selectedGradeIds.filter((x) => x !== id)
          : [...selectedGradeIds, id];
        
        set({ selectedGradeIds: nextIds, sessionId: null });
      },
      setReferenceGradeId: (id) => set({ referenceGradeId: id }),

      setSearchQuery: (searchQuery) => set({ searchQuery }),
      setFilterCategory: (filterCategory) => set({ filterCategory }),
      setFilterBaseMetal: (filterBaseMetal) => set({ filterBaseMetal }),
      setSortBy: (sortBy) => set({ sortBy }),
      setOrderQuantity: (orderQuantity) => set({ orderQuantity }),

      setIsFullScreen: (isFullScreen) => set({ isFullScreen }),
      setHighlightDiffs: (highlightDiffs) => set({ highlightDiffs }),
      setCollapsedGroups: (collapsedGroups) => set({ collapsedGroups }),
      toggleGroup: (group) => set((state) => ({
        collapsedGroups: {
          ...state.collapsedGroups,
          [group]: !state.collapsedGroups[group],
        }
      })),

      setSessionId: (sessionId) => set({ sessionId }),
      setExportStatus: (exportStatus) => set({ exportStatus }),
      addRecentComparison: (session) => set((state) => ({
        recentComparisons: [session, ...state.recentComparisons.filter(s => s.id !== session.id)].slice(0, 10)
      })),

      resetState: () => set({ ...initialState, recentComparisons: get().recentComparisons }),
    }),
    {
      name: "mcms-comparison-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // We persist everything except temporary states
        selectedGradeIds: state.selectedGradeIds,
        referenceGradeId: state.referenceGradeId,
        filterCategory: state.filterCategory,
        filterBaseMetal: state.filterBaseMetal,
        orderQuantity: state.orderQuantity,
        highlightDiffs: state.highlightDiffs,
        collapsedGroups: state.collapsedGroups,
        recentComparisons: state.recentComparisons,
        sessionId: state.sessionId,
      }),
    }
  )
);
