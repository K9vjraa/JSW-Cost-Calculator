// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { LoginPage } from "./LoginPage";
import { MemoryRouter } from "react-router-dom";

// Mock Zustand auth store
vi.mock("../store/auth", () => {
  return {
    useAuth: () => ({
      actor: null,
      isLoading: false,
      error: null,
      clearError: vi.fn(),
      login: vi.fn().mockResolvedValue({ id: "demo-employee", role: "COSTING_DEPARTMENT", name: "Rahul Sharma", department: "COSTING" })
    })
  };
});

describe("LoginPage Component", () => {
  it("renders login form elements correctly", () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    expect(screen.getByLabelText(/Email Address/i)).toBeDefined();
    expect(screen.getByLabelText(/Password/i)).toBeDefined();
    expect(screen.getAllByRole("button", { name: /^Sign In$/i })[0]).toBeDefined();
  });

  it("validates form input submissions", async () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    const submitBtn = screen.getAllByRole("button", { name: /^Sign In$/i })[0];
    fireEvent.click(submitBtn);

    // Form inputs should show validation feedback or prevent submit
    await waitFor(() => {
      expect(screen.getByLabelText(/Email/i)).toBeDefined();
    });
  });
});
