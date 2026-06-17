// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { WorkspacePage } from "./WorkspacePage";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Mock Zustand stores
vi.mock("@/store/auth", () => ({
  useAuth: () => ({
    actor: { id: "demo-user", role: "USER", name: "Standard User" }
  })
}));

vi.mock("@/store/workspaceStore", () => ({
  useWorkspaceStore: () => ({
    items: [],
    mode: "alloy",
    setMode: vi.fn(),
    addItem: vi.fn(),
    removeItem: vi.fn(),
    updateItem: vi.fn()
  })
}));

vi.mock("@/store/calculationStore", () => ({
  useCalculationStore: () => ({
    cards: [],
    isLoading: false,
    error: null,
    fetchCalculations: vi.fn(),
    saveDraft: vi.fn(),
    promoteToComplete: vi.fn()
  })
}));

vi.mock("@/store/recipeStore", () => ({
  useRecipeStore: () => ({
    recipeName: "Test Recipe",
    recipeCode: "REC-TEST",
    targetQty: 0,
    targetGrade: "",
    materials: [],
    savedRecipes: [],
    isLoading: false,
    fetchRecipes: vi.fn(),
    setRecipeName: vi.fn(),
    setRecipeCode: vi.fn(),
    setTargetQty: vi.fn(),
    setTargetGrade: vi.fn(),
    setMaterials: vi.fn(),
    saveRecipe: vi.fn(),
    loadRecipe: vi.fn(),
    cloneRecipe: vi.fn()
  })
}));

vi.mock("@/store/productStore", () => ({
  useProductStore: () => ({
    metals: [],
    grades: [],
    rawMaterials: [],
    categories: [],
    isLoading: false,
    fetchCatalog: vi.fn()
  })
}));

describe("WorkspacePage Component", () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  it("renders workspace mode options", () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <WorkspacePage />
        </MemoryRouter>
      </QueryClientProvider>
    );

    // Should find workspace mode selection elements
    expect(screen.getByText(/JSW Cost Allocation Workspace/i)).toBeDefined();
    expect(screen.getByText(/Metal Calculator/i)).toBeDefined();
    expect(screen.getByText(/Central Locked Prices/i)).toBeDefined();
  });
});
