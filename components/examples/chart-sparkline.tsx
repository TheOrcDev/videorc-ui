"use client";

import { Area, AreaChart, YAxis } from "recharts";

import { WarningIcon } from "@/components/icons";
import { ChartContainer } from "@/components/ui/chart";
import type { ChartConfig } from "@/components/ui/chart";

const neutral = {
  value: { color: "var(--muted-foreground)", label: "Value" },
} satisfies ChartConfig;

// Colour only when the tile itself is a warning.
const warning = {
  value: { color: "var(--warning)", label: "Value" },
} satisfies ChartConfig;

const toPoints = (values: number[]) =>
  values.map((value, index) => ({ index, value }));

const Sparkline = ({
  config,
  values,
}: {
  config: ChartConfig;
  values: number[];
}) => (
  // No axes, no tooltip, no animation: the number above it is the reading.
  <ChartContainer
    aria-hidden
    className="aspect-auto h-6 w-full"
    config={config}
    initialDimension={{ height: 24, width: 120 }}
  >
    <AreaChart
      data={toPoints(values)}
      margin={{ bottom: 0, left: 0, right: 0, top: 2 }}
    >
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

const ChartSparkline = () => (
  <div className="grid w-full max-w-lg grid-cols-3 gap-4">
    <div className="flex flex-col gap-1">
      <span className="text-muted-foreground text-xs">Bitrate</span>
      <span className="text-sm font-semibold tabular-nums">6,012 kbps</span>
      <Sparkline
        config={neutral}
        values={[
          6010, 5980, 6040, 5990, 6020, 5210, 3870, 4960, 5940, 6010, 6030,
          6012,
        ]}
      />
    </div>
    <div className="flex flex-col gap-1">
      <span className="text-muted-foreground text-xs">Viewers</span>
      <span className="text-sm font-semibold tabular-nums">214</span>
      <Sparkline
        config={neutral}
        values={[42, 66, 81, 102, 120, 133, 151, 168, 177, 190, 205, 214]}
      />
    </div>
    <div className="flex flex-col gap-1">
      <span className="text-muted-foreground flex items-center gap-1 text-xs">
        <WarningIcon className="text-warning" />
        Dropped frames
      </span>
      <span className="text-sm font-semibold tabular-nums">2.4%</span>
      <Sparkline
        config={warning}
        values={[0, 0, 0.1, 0, 0.2, 1.1, 3.8, 2.9, 2.2, 2.6, 2.3, 2.4]}
      />
    </div>
  </div>
);

export default ChartSparkline;
