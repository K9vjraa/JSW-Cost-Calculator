// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Button } from "./Button";

describe("Button component", () => {
  it("renders correctly with primary variant by default", () => {
    render(<Button>Verify composition run</Button>);
    const buttonEl = screen.getByRole("button", { name: /verify composition run/i });
    expect(buttonEl).toBeDefined();
    expect(buttonEl.textContent).toBe("Verify composition run");
  });

  it("applies standard disabled attribute when in loading state", () => {
    render(<Button isLoading>Finalize calculations</Button>);
    const buttonEl = screen.getByRole("button", { name: /finalize calculations/i }) as HTMLButtonElement;
    expect(buttonEl.disabled).toBe(true);
  });
});
