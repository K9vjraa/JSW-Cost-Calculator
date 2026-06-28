// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { DashboardPage } from "./Dashboards";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Mock Zustand auth store
vi.mock("@/store/auth", () => {
  return {
    useAuth: () => ({
      actor: { id: "demo-admin", role: "COSTING_DEPARTMENT", name: "Admin User", department: "COSTING_DEPARTMENT" }
    })
  };
});

// Mock apiClient to return mock dashboard data
import { adminDashboard } from "@/data/fixtures";
vi.mock("@/services/api/client", () => {
  return {
    apiClient: {
      get: vi.fn((url: string) => {
        if (url === "/dashboard/admin") {
          return Promise.resolve({ data: adminDashboard });
        }
        return Promise.resolve({ data: {} });
      })
    }
  };
});

describe("DashboardPage Component", () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  it("renders Admin Dashboard correctly for COSTING_DEPARTMENT role", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <DashboardPage />
        </MemoryRouter>
      </QueryClientProvider>
    );

    expect(await screen.findByText(/System Control Dashboard/i)).toBeDefined();
    expect(await screen.findByText(/Calculations Saved/i)).toBeDefined();
    expect(await screen.findByText(/Configured Alloys/i)).toBeDefined();
  });
});
