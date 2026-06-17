// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { DashboardPage } from "./Dashboards";
import { MemoryRouter } from "react-router-dom";

// Mock Zustand auth store
vi.mock("@/store/auth", () => {
  return {
    useAuth: () => ({
      actor: { id: "demo-admin", role: "COSTING_DEPARTMENT", name: "Admin User", department: "COSTING_DEPARTMENT" }
    })
  };
});

// Mock useRemote hook to return mock dashboard data synchronously
vi.mock("@/hooks/useRemote", () => {
  return {
    useRemote: (_loader: unknown, fallback: unknown) => ({
      data: fallback,
      loading: false
    })
  };
});

describe("DashboardPage Component", () => {
  it("renders Admin Dashboard correctly for ADMIN role", () => {
    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    );

    expect(screen.getByText(/System Control Dashboard/i)).toBeDefined();
    expect(screen.getByText(/Calculations Saved/i)).toBeDefined();
    expect(screen.getByText(/Configured Alloys/i)).toBeDefined();
  });
});
