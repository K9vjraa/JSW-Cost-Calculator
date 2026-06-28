import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { ComparisonCache } from "../cache/comparison.cache.js";

describe("ComparisonCache", () => {
  beforeEach(async () => {
    await ComparisonCache.clearPattern("");
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should return null for non-existent key", async () => {
    const value = await ComparisonCache.get("missing_key");
    expect(value).toBeNull();
  });

  it("should set and get a value", async () => {
    await ComparisonCache.set("test_key", { data: "test" }, 10);
    const value = await ComparisonCache.get<{ data: string }>("test_key");
    expect(value).toEqual({ data: "test" });
  });

  it("should expire a value after TTL", async () => {
    await ComparisonCache.set("test_key", { data: "test" }, 5);
    
    // Fast-forward time by 6 seconds
    vi.advanceTimersByTime(6000);
    
    const value = await ComparisonCache.get("test_key");
    expect(value).toBeNull();
  });

  it("should delete a value", async () => {
    await ComparisonCache.set("test_key", { data: "test" });
    await ComparisonCache.delete("test_key");
    const value = await ComparisonCache.get("test_key");
    expect(value).toBeNull();
  });

  it("should clear patterns", async () => {
    await ComparisonCache.set("session_1", "a");
    await ComparisonCache.set("session_2", "b");
    await ComparisonCache.set("other_1", "c");

    await ComparisonCache.clearPattern("session_");

    expect(await ComparisonCache.get("session_1")).toBeNull();
    expect(await ComparisonCache.get("session_2")).toBeNull();
    expect(await ComparisonCache.get("other_1")).toBe("c");
  });
});
