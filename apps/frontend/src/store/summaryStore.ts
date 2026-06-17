import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
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


export interface SummaryState {
  summaryItems: SummaryItem[];
  workflowStatus: "Draft" | "Ready" | "Submitted" | "Approved";
  
  setSummaryItems: (items: SummaryItem[]) => void;
  addSummaryItem: (item: SummaryItem) => void;
  removeSummaryItem: (id: string) => void;
  clearSummary: () => void;
  setWorkflowStatus: (status: "Draft" | "Ready" | "Submitted" | "Approved") => void;
}

export const useSummaryStore = create<SummaryState>()(
  persist(
    (set) => ({
      summaryItems: [],
      workflowStatus: "Draft",
      
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
      
      setWorkflowStatus: (workflowStatus) => set({ workflowStatus })
    }),
    {
      name: "mcms-summary-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        summaryItems: state.summaryItems,
        workflowStatus: state.workflowStatus
      })
    }
  )
);

export default useSummaryStore;
