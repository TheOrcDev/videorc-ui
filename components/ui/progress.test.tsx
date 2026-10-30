import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Progress } from "@/components/ui/progress";

describe("Progress", () => {
  it("is a named progressbar on a round track with the chrome fill", () => {
    const { container } = render(
      <Progress aria-label="Update download" value={40} />
    );
    const bar = screen.getByRole("progressbar", { name: "Update download" });
    expect(bar).toHaveAttribute("aria-valuenow", "40");
    expect(bar).toHaveAttribute("aria-valuemax", "100");
    const track = container.querySelector('[data-slot="progress-track"]');
    expect(track?.className).toContain("rounded-full");
    expect(track?.className).toContain("h-1.5");
    const indicator = container.querySelector<HTMLElement>(
      '[data-slot="progress-indicator"]'
    );
    expect(indicator?.className).toContain("chrome-fill");
    expect(indicator?.className).not.toContain("bg-primary");
    expect(indicator?.style.width).toBe("40%");
  });

  it("runs to its own max, and reads a non-positive max as 100", () => {
    const { container, rerender } = render(
      <Progress aria-label="Making the moves" max={8} value={2} />
    );
    const indicator = () =>
      container.querySelector<HTMLElement>('[data-slot="progress-indicator"]');
    expect(indicator()?.style.width).toBe("25%");
    rerender(<Progress aria-label="Making the moves" max={0} value={0} />);
    expect(screen.getByRole("progressbar")).toHaveAttribute(
      "aria-valuemax",
      "100"
    );
    expect(indicator()?.style.width).toBe("0%");
  });
});
