import { create } from "zustand";
import type { Grade } from "@/types";
import { gradeApi } from "../services/api/grade.api";

export interface GradeState {
  grades: Grade[];
  isLoading: boolean;
  error: string | null;
  setGrades: (grades: Grade[]) => void;
  fetchGrades: (metalId?: string) => Promise<void>;
  fetchAllGrades: () => Promise<void>;
  addGrade: (grade: Grade) => void;
  clearError: () => void;
}

export const useGradeStore = create<GradeState>((set) => ({
  grades: [],
  isLoading: false,
  error: null,

  setGrades: (grades) => set({ grades }),

  fetchGrades: async (metalId?: string) => {
    set({ isLoading: true, error: null });
    try {
      const data = await gradeApi.getGrades(metalId);
      set({ grades: data, isLoading: false });
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Failed to fetch grades";
      set({ error: errMsg, isLoading: false });
    }
  },

  fetchAllGrades: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await gradeApi.getAllGrades();
      set({ grades: data, isLoading: false });
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Failed to fetch all grades";
      set({ error: errMsg, isLoading: false });
    }
  },

  addGrade: (grade) =>
    set((state) => ({
      grades: [...state.grades, grade],
    })),

  clearError: () => set({ error: null }),
}));

export default useGradeStore;
