// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MastersPage } from "./OperationsPages";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Mock Zustand stores
vi.mock("../store/auth", () => ({
  useAuth: () => ({
    actor: { id: "demo-admin", role: "COSTING_DEPARTMENT", name: "Admin User" }
  }),
  useAuthStore: () => ({})
}));

vi.mock("../store/uiStore", () => ({
  useUIStore: () => ({})
}));

vi.mock("../store/settingsStore", () => ({
  useSettingsStore: () => ({})
}));

vi.mock("../store/workspaceStore", () => ({
  useWorkspaceStore: () => ({})
}));

vi.mock("../store/recipeStore", () => ({
  useRecipeStore: () => ({})
}));

vi.mock("../store/productStore", () => ({
  useProductStore: () => ({})
}));

// Mock custom hooks
vi.mock("@/hooks/useTableQuery", () => ({
  useTableQuery: () => ({
    query: { page: 1, limit: 10, search: "", sortBy: "name", sortDir: "asc", filters: {} },
    params: { page: 1, limit: 10, search: "" },
    setQuery: vi.fn(),
    queryKey: "mock-key"
  })
}));

vi.mock("@/hooks/useQuery", () => ({
  useUsers: () => ({
    data: { data: [] },
    isLoading: false
  })
}));

describe("OperationsPages MastersPage Component", () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  it("renders MastersPage correctly for COSTING_DEPARTMENT", () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <MastersPage focus="material-master" />
        </MemoryRouter>
      </QueryClientProvider>
    );

    expect(screen.getByText(/Material Master/i)).toBeDefined();
    expect(screen.getByText(/Metals Master/i)).toBeDefined();
  });
});
