import { readFileSync } from "node:fs";
import path from "node:path";

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const source = readFileSync(
  path.join(process.cwd(), "components/ui/tooltip.tsx"),
  "utf-8"
);

const PinTooltip = () => (
  <Tooltip defaultOpen>
    <TooltipTrigger>Keep on top</TooltipTrigger>
    <TooltipContent>Pin this window</TooltipContent>
  </Tooltip>
);

describe("Tooltip", () => {
  it("still mounts outside a provider, so a stray root never throws", async () => {
    render(<PinTooltip />);
    expect(await screen.findByText("Pin this window")).toHaveAttribute(
      "data-slot",
      "tooltip-content"
    );
  });

  it("mounts the provider with the desktop delay", () => {
    expect(source).toContain("delay = 600");
    expect(() =>
      render(
        <TooltipProvider>
          <span>Studio</span>
        </TooltipProvider>
      )
    ).not.toThrow();
  });

  it("sits on the tooltip tier of the float glass, never an inverted pill", async () => {
    render(
      <TooltipProvider>
        <PinTooltip />
      </TooltipProvider>
    );
    const popup = await screen.findByText("Pin this window");
    expect(popup).toHaveClass(
      "glass-float-tooltip",
      "rounded-row",
      "border",
      "data-open:zoom-in-[0.98]",
      "duration-100"
    );
    expect(popup.className).not.toMatch(
      /bg-foreground|bg-popover|slide-in-from/u
    );
  });
});
