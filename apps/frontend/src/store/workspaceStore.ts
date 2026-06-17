import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface WorkspaceState {
  mode: "calculator" | "builder";
  selectedCardId: string | null;
  setMode: (mode: "calculator" | "builder") => void;
  setSelectedCardId: (id: string | null) => void;
}

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set) => ({
      mode: "calculator",
      selectedCardId: null,
      
      setMode: (mode) => set({ mode }),
      setSelectedCardId: (selectedCardId) => set({ selectedCardId })
    }),
    {
      name: "mcms-workspace-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        mode: state.mode,
        selectedCardId: state.selectedCardId
      })
    }
  )
);

export default useWorkspaceStore;
