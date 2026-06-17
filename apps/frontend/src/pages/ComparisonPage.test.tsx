// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ComparisonPage } from "./ComparisonPage";
import { MemoryRouter } from "react-router-dom";

// Mock fixtures data
vi.mock("@/data/fixtures", () => ({
  grades: [
    {
      id: "grade-1",
      name: "Test Grade 1",
      metalId: "metal-1",
      multiplier: 1.2,
      extraPrice: 10,
      status: "ACTIVE",
      mechanicalProperties: { UTS: "500 MPa" },
      chemicalComposition: { C: "0.15%" },
      metal: { name: "Test Metal 1", category: "Ferrous" }
    }
  ]
}));

describe("ComparisonPage Component", () => {
  it("renders comparison components and selectors", () => {
    render(
      <MemoryRouter>
        <ComparisonPage />
      </MemoryRouter>
    );

    expect(screen.getByText(/Multi-Alloy Comparison Engine/i)).toBeDefined();
    expect(screen.getByText(/Simulate Order Volume/i)).toBeDefined();
    expect(screen.getAllByText(/Test Grade 1/i).length).toBeGreaterThanOrEqual(1);
  });
});
