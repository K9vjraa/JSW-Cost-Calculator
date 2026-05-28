import { describe, expect, it } from "vitest";
import { calculateBreakdown } from "../src/services/calculation.js";

describe("calculateBreakdown", () => {
  it("calculates correct base and final material cost totals", () => {
    const result = calculateBreakdown(
      [
        { id: "steel", name: "SS304", quantity: "100", unitPrice: "20", gradeMultiplier: "1.1", extraPrice: "50" },
        { id: "nickel", name: "Nickel", quantity: "2.5", unitPrice: "850", gradeMultiplier: "1" }
      ],
      []
    );

    expect(result.baseCost).toBe("4375");
    expect(result.finalCost).toBe("4375");
  });

  it("rejects empty item sets", () => {
    expect(() => calculateBreakdown([], [])).toThrow("At least one costing item");
  });
});
