// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { localBreakdown } from "./WorkspacePage";

describe("localBreakdown", () => {
  it("previews master-locked material cost for metal mode", () => {
    const preview = localBreakdown([{ id: "item", metalId: "metal-ss", gradeId: "grade-304", quantity: 100 }], "metal");
    expect(preview.items[0].unitPrice).toBe("62.5");
    expect(Number(preview.baseCost)).toBeCloseTo(6375);
    expect(Number(preview.finalCost)).toBeCloseTo(6375);
  });
});
