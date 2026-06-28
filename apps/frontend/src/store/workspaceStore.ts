import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { CalculationCardState } from "../components/CalculationCard";

// Summary item structure
export interface SummaryItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  gradeMultiplier: number;
  extraPrice: number;
  baseCost: number;
  metalId: string;
  gradeId: string;
  categoryName: string;
  steelTypeName: string;
  gradeName: string;
  subGradeName: string;
  rawMaterials: any[];
  isAlloyed: boolean;
}

export type WorkspaceMode = "metal" | "raw-material" | "grade-builder";

export interface WorkspaceState {
  mode: WorkspaceMode;
  selectedCardId: string | null;
  cards: CalculationCardState[];
  summaryItems: SummaryItem[];
  workflowStatus: "Draft" | "Ready" | "Submitted" | "Approved";
  orderQuantity: number;
  activeCalculationId: string | null;
  comparisonSelections: string[];
  lastSavedAt: string | null;

  setMode: (mode: WorkspaceMode) => void;
  setSelectedCardId: (id: string | null) => void;
  
  setCards: (cards: CalculationCardState[]) => void;
  addCard: (card: CalculationCardState) => void;
  updateCard: (id: string, data: Partial<CalculationCardState>) => void;
  removeCard: (id: string) => void;

  setSummaryItems: (items: SummaryItem[]) => void;
  addSummaryItem: (item: SummaryItem) => void;
  removeSummaryItem: (id: string) => void;
  clearSummary: () => void;

  setWorkflowStatus: (status: "Draft" | "Ready" | "Submitted" | "Approved") => void;
  setOrderQuantity: (qty: number) => void;
  setActiveCalculationId: (id: string | null) => void;
  setComparisonSelections: (ids: string[]) => void;
  setLastSavedAt: (date: string | null) => void;
}

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set) => ({
      mode: "metal",
      selectedCardId: null,
      cards: [],
      summaryItems: [],
      workflowStatus: "Draft",
      orderQuantity: 1000,
      activeCalculationId: null,
      comparisonSelections: [],
      lastSavedAt: null,
      
      setMode: (mode) => set({ mode }),
      setSelectedCardId: (selectedCardId) => set({ selectedCardId }),
      
      setCards: (cards) => set({ cards }),
      addCard: (card) => set((state) => ({ cards: [...state.cards, card] })),
      updateCard: (id, data) => set((state) => ({
        cards: state.cards.map((c) => (c.id === id ? { ...c, ...data } : c))
      })),
      removeCard: (id) => set((state) => ({
        cards: state.cards.filter((c) => c.id !== id),
        summaryItems: state.summaryItems.filter((item) => item.id !== id) // Keep synchronized
      })),

      setSummaryItems: (summaryItems) => set({ summaryItems }),
      addSummaryItem: (newItem) => set((state) => {
        const exists = state.summaryItems.some((item) => item.id === newItem.id);
        const nextItems = exists
          ? state.summaryItems.map((item) => (item.id === newItem.id ? newItem : item))
          : [...state.summaryItems, newItem];
        return { summaryItems: nextItems };
      }),
      removeSummaryItem: (id) => set((state) => ({
        summaryItems: state.summaryItems.filter((item) => item.id !== id)
      })),
      clearSummary: () => set({ summaryItems: [] }),

      setWorkflowStatus: (workflowStatus) => set({ workflowStatus }),
      setOrderQuantity: (orderQuantity) => set({ orderQuantity }),
      setActiveCalculationId: (activeCalculationId) => set({ activeCalculationId }),
      setComparisonSelections: (comparisonSelections) => set({ comparisonSelections }),
      setLastSavedAt: (lastSavedAt) => set({ lastSavedAt })
    }),
    {
      name: "mcms-unified-workspace-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        mode: state.mode,
        selectedCardId: state.selectedCardId,
        cards: state.cards,
        summaryItems: state.summaryItems,
        workflowStatus: state.workflowStatus,
        orderQuantity: state.orderQuantity,
        activeCalculationId: state.activeCalculationId,
        comparisonSelections: state.comparisonSelections,
        lastSavedAt: state.lastSavedAt
      })
    }
  )
);

export default useWorkspaceStore;
