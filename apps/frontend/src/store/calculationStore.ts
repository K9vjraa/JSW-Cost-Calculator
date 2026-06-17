import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { CalculationCardState } from "../components/CalculationCard";
import type { SummaryItem } from "../components/LiveSummaryPanel";

export interface CalculationState {
  cards: CalculationCardState[];
  summaryItems: SummaryItem[];
  orderQuantity: number;
  setCards: (cards: CalculationCardState[]) => void;
  addCard: (card: CalculationCardState) => void;
  updateCard: (card: CalculationCardState) => void;
  removeCard: (id: string) => void;
  setSummaryItems: (items: SummaryItem[]) => void;
  addSummaryItem: (item: SummaryItem) => void;
  removeSummaryItem: (id: string) => void;
  clearSummary: () => void;
  setOrderQuantity: (qty: number) => void;
}

// ── Persistent Zustand Store for Cost Sheets & Cards ──────────────────────────
export const useCalculationStore = create<CalculationState>()(
  persist(
    (set) => ({
      cards: [],
      summaryItems: [],
      orderQuantity: 1000,

      setCards: (cards: CalculationCardState[]) => set({ cards }),
      
      addCard: (card: CalculationCardState) => set((state) => ({ 
        cards: [...state.cards, card] 
      })),
      
      updateCard: (updated: CalculationCardState) => set((state) => ({
        cards: state.cards.map((c) => (c.id === updated.id ? updated : c))
      })),
      
      removeCard: (id: string) => set((state) => ({
        cards: state.cards.filter((c) => c.id !== id),
        summaryItems: state.summaryItems.filter((item) => item.id !== id)
      })),
      
      setSummaryItems: (summaryItems: SummaryItem[]) => set({ summaryItems }),
      
      addSummaryItem: (newItem: SummaryItem) => set((state) => {
        const exists = state.summaryItems.some((item) => item.id === newItem.id);
        const nextItems = exists
          ? state.summaryItems.map((item) => (item.id === newItem.id ? newItem : item))
          : [...state.summaryItems, newItem];
        return { summaryItems: nextItems };
      }),
      
      removeSummaryItem: (id: string) => set((state) => ({
        summaryItems: state.summaryItems.filter((item) => item.id !== id)
      })),
      
      clearSummary: () => set({ summaryItems: [] }),
      
      setOrderQuantity: (orderQuantity: number) => set({ orderQuantity })
    }),
    {
      name: "mcms-calculation-storage",
      storage: createJSONStorage(() => localStorage), // Persist cards and sheet list in localStorage
      partialize: (state) => ({
        cards: state.cards,
        summaryItems: state.summaryItems,
        orderQuantity: state.orderQuantity
      })
    }
  )
);

export default useCalculationStore;
