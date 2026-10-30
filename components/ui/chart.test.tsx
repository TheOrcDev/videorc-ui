import { render } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import type { ChartConfig } from "@/components/ui/chart";

// jsdom lays nothing out, so the responsive container would measure 0 × 0
// and render no chart: let its children through as they are.
vi.mock("recharts", async (importOriginal) => ({
  ...(await importOriginal<object>()),
  ResponsiveContainer: ({ children }: { children?: ReactNode }) => children,
}));

const config = {
  bitrate: { color: "var(--muted-foreground)", label: "Bitrate" },
} satisfies ChartConfig;

describe("ChartTooltipContent", () => {
  it("floats on the popup glass, never an inverted or ringed popover", () => {
    const { container } = render(
      <ChartContainer config={config}>
        <ChartTooltipContent
          active
          label="12:04"
          payload={[
            {
              color: "var(--color-bitrate)",
              dataKey: "bitrate",
              graphicalItemId: "bitrate",
              name: "bitrate",
              payload: { bitrate: 6000 },
              value: 6000,
            },
          ]}
        />
      </ChartContainer>
    );
    const tooltip = container.querySelector('[data-slot="chart-tooltip"]');
    expect(tooltip?.className).toMatch(/\bborder\b/u);
    expect(tooltip?.className).toContain("glass-float");
    expect(tooltip?.className).toContain("rounded-row");
    expect(tooltip?.className).not.toMatch(/bg-popover|shadow-lg|rounded-xl/u);
    expect(tooltip?.textContent).toContain("Bitrate");
    expect(tooltip?.textContent).toContain((6000).toLocaleString());
  });

  it("scopes each series colour to its chart, per theme", () => {
    const { container } = render(
      <ChartContainer config={config} id="health">
        <div />
      </ChartContainer>
    );
    const css = container.querySelector("style")?.innerHTML ?? "";
    expect(css).toContain(".dark [data-chart=chart-health]");
    expect(css).toContain("--color-bitrate: var(--muted-foreground);");
  });
});
