import { create } from "zustand";

export interface GradeMaterialItem {
  id: string; // local UI id for drag and drop
  materialId: string;
  materialName: string;
  materialCode: string;
  compositionPercent: number;
  rate: number;
}

export interface DraftGrade {
  name: string;
  code: string;
  category: string;
  steelType: string;
  subGrade: string;
  description: string;
}

interface GradeBuilderState {
  selectedGradeId: string | null;
  targetQuantity: number;
  materials: GradeMaterialItem[];
  draftGrade: DraftGrade;
  isSidebarOpen: boolean;
  
  // Actions
  toggleSidebar: () => void;
  setSelectedGradeId: (id: string | null) => void;
  setTargetQuantity: (qty: number) => void;
  setMaterials: (materials: GradeMaterialItem[]) => void;
  addMaterial: (item: Omit<GradeMaterialItem, "id">) => void;
  removeMaterial: (id: string) => void;
  updateComposition: (id: string, percent: number) => void;
  reorderMaterials: (startIndex: number, endIndex: number) => void;
  updateDraftField: (field: keyof DraftGrade, value: string) => void;
  reset: () => void;
}

const initialDraft: DraftGrade = {
  name: "",
  code: `GRD-${Math.floor(1000 + Math.random() * 9000)}`,
  category: "",
  steelType: "",
  subGrade: "",
  description: "",
};

export const useGradeBuilderStore = create<GradeBuilderState>((set) => ({
  selectedGradeId: null,
  targetQuantity: 1000,
  materials: [],
  draftGrade: { ...initialDraft },
  isSidebarOpen: true,

  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setSelectedGradeId: (id) => set({ selectedGradeId: id }),
  
  setTargetQuantity: (qty) => set({ targetQuantity: qty }),
  
  setMaterials: (materials) => set({ materials }),

  addMaterial: (item) =>
    set((state) => ({
      materials: [...state.materials, { ...item, id: crypto.randomUUID() }],
    })),

  removeMaterial: (id) =>
    set((state) => ({
      materials: state.materials.filter((m) => m.id !== id),
    })),

  updateComposition: (id, percent) =>
    set((state) => ({
      materials: state.materials.map((m) =>
        m.id === id ? { ...m, compositionPercent: percent } : m
      ),
    })),

  reorderMaterials: (startIndex, endIndex) =>
    set((state) => {
      const result = Array.from(state.materials);
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);
      return { materials: result };
    }),

  updateDraftField: (field, value) =>
    set((state) => ({
      draftGrade: { ...state.draftGrade, [field]: value },
    })),

  reset: () =>
    set({
      selectedGradeId: 'new', // Set to 'new' so it doesn't show the empty state when New Grade is clicked
      targetQuantity: 1000,
      materials: [],
      draftGrade: { 
        name: "",
        code: `GRD-${Math.floor(1000 + Math.random() * 9000)}`,
        category: "",
        steelType: "",
        subGrade: "",
        description: "",
      },
    }),
}));
