"use client";

import type { ReactElement } from "react";
import { Area, AreaChart, YAxis } from "recharts";

import { ChartContainer } from "@/components/ui/chart";
import type { ChartConfig } from "@/components/ui/chart";
import { cn } from "@/lib/utils";

interface StatsSparklineProps {
  /** The readings, oldest first. Fewer than two draws nothing. */
  points: readonly number[];
  /** What it plots, for the chart's config. */
  label: string;
  /** `warning` only when the stat itself is in trouble. */
  tone?: "neutral" | "warning";
  /** The first frame's size, before the container is measured. */
  size?: { width: number; height: number };
  className?: string;
}

const DEFAULT_SIZE = { height: 24, width: 120 } as const;

/**
 * A stat's sparkline, on the shadcn chart. Neutral by default; a warning
 * tone only when the stat is. No axes, no tooltip, no animation: the number
 * beside it is the reading.
 */
function StatsSparkline({
  points,
  label,
  tone = "neutral",
  size = DEFAULT_SIZE,
  className,
}: StatsSparklineProps): ReactElement | null {
  if (points.length < 2) {
    return null;
  }
  const config = {
    value: {
      color: tone === "warning" ? "var(--warning)" : "var(--muted-foreground)",
      label,
    },
  } satisfies ChartConfig;
  const data = points.map((value, index) => ({ index, value }));
  return (
    <ChartContainer
      aria-hidden
      className={cn("aspect-auto h-6 w-full", className)}
      config={config}
      initialDimension={size}
    >
      <AreaChart data={data} margin={{ bottom: 0, left: 0, right: 0, top: 2 }}>
        <YAxis dataKey="value" domain={["dataMin", "dataMax"]} hide />
        <Area
          dataKey="value"
          dot={false}
          fill="var(--color-value)"
          fillOpacity={0.14}
          isAnimationActive={false}
          stroke="var(--color-value)"
          strokeWidth={1.25}
          type="monotone"
        />
      </AreaChart>
    </ChartContainer>
  );
}

export { StatsSparkline, type StatsSparklineProps };
