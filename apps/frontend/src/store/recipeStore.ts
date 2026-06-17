import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { RawMaterialItem } from "../components/RawMaterialTable";

export interface StandaloneRecipe {
  name: string;
  code: string;
  targetQty: number;
  targetGrade: string;
  materials: RawMaterialItem[];
}

export interface RecipeState {
  recipeName: string;
  recipeCode: string;
  targetQty: number;
  targetGrade: string;
  materials: RawMaterialItem[];
  savedRecipes: StandaloneRecipe[];
  
  setRecipeName: (name: string) => void;
  setRecipeCode: (code: string) => void;
  setTargetQty: (qty: number) => void;
  setTargetGrade: (grade: string) => void;
  setMaterials: (materials: RawMaterialItem[]) => void;
  
  addMaterial: (defaultMaterialId: string) => void;
  updateMaterial: (id: string, updated: Partial<RawMaterialItem>) => void;
  removeMaterial: (id: string) => void;
  
  saveRecipe: () => { success: boolean; message: string };
  loadRecipe: (recipe: StandaloneRecipe) => void;
  cloneRecipe: () => { success: boolean; message: string };
}

export const useRecipeStore = create<RecipeState>()(
  persist(
    (set, get) => ({
      recipeName: "Custom Alloy Recipe",
      recipeCode: "RECIPE-A1",
      targetQty: 1000,
      targetGrade: "E250A",
      materials: [],
      savedRecipes: [],

      setRecipeName: (recipeName) => set({ recipeName }),
      setRecipeCode: (recipeCode) => set({ recipeCode }),
      setTargetQty: (targetQty) => {
        const nextQty = Math.max(0, targetQty);
        // Reactively scale quantities based on composition percentages
        const updatedMaterials = get().materials.map((m) => {
          const pct = m.compositionPct !== undefined ? m.compositionPct : 10;
          return {
            ...m,
            quantity: (pct / 100) * nextQty
          };
        });
        set({ targetQty: nextQty, materials: updatedMaterials });
      },
      setTargetGrade: (targetGrade) => set({ targetGrade }),
      setMaterials: (materials) => set({ materials }),

      addMaterial: (defaultMaterialId) => {
        const targetQty = get().targetQty;
        const newMaterial: RawMaterialItem = {
          id: crypto.randomUUID(),
          rawMaterialId: defaultMaterialId,
          quantity: targetQty > 0 ? targetQty * 0.1 : 10,
          compositionPct: 10
        };
        set((state) => ({ materials: [...state.materials, newMaterial] }));
      },

      updateMaterial: (id, updatedFields) => {
        const targetQty = get().targetQty;
        const updated = get().materials.map((m) => {
          if (m.id === id) {
            const nextMat = { ...m, ...updatedFields };
            // If compositionPct changed, recalculate quantity
            if (updatedFields.compositionPct !== undefined) {
              const safePct = Math.max(0, Math.min(100, updatedFields.compositionPct));
              nextMat.compositionPct = safePct;
              nextMat.quantity = targetQty > 0 ? (safePct / 100) * targetQty : 0;
            }
            return nextMat;
          }
          return m;
        });
        set({ materials: updated });
      },

      removeMaterial: (id) => set((state) => ({
        materials: state.materials.filter((m) => m.id !== id)
      })),

      saveRecipe: () => {
        const name = get().recipeName.trim();
        const code = get().recipeCode.trim();
        if (!name) {
          return { success: false, message: "Please enter a valid recipe name." };
        }
        
        const newRecipe: StandaloneRecipe = {
          name,
          code,
          targetQty: get().targetQty,
          targetGrade: get().targetGrade,
          materials: get().materials
        };

        const updatedList = [
          ...get().savedRecipes.filter(r => r.name.toLowerCase() !== name.toLowerCase()),
          newRecipe
        ];
        
        set({ savedRecipes: updatedList });
        return { success: true, message: `Standalone recipe "${name}" saved!` };
      },

      loadRecipe: (recipe) => set({
        recipeName: recipe.name,
        recipeCode: recipe.code,
        targetQty: recipe.targetQty,
        targetGrade: recipe.targetGrade,
        materials: recipe.materials
      }),

      cloneRecipe: () => {
        const baseName = get().recipeName;
        const cloneName = `${baseName} (Copy)`;
        const cloneCode = `${get().recipeCode}-CLONE`;
        const clonedMaterials = get().materials.map(m => ({ ...m, id: crypto.randomUUID() }));

        set({
          recipeName: cloneName,
          recipeCode: cloneCode,
          materials: clonedMaterials
        });

        return { success: true, message: `Standalone recipe cloned as "${cloneName}"!` };
      }
    }),
    {
      name: "mcms-recipe-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        recipeName: state.recipeName,
        recipeCode: state.recipeCode,
        targetQty: state.targetQty,
        targetGrade: state.targetGrade,
        materials: state.materials,
        savedRecipes: state.savedRecipes
      })
    }
  )
);

export default useRecipeStore;
