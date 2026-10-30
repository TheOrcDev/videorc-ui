"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  XAxis,
  YAxis,
} from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { ChartConfig } from "@/components/ui/chart";

const TARGET_KBPS = 6000;

// The outgoing bitrate over the first hour of a livestream: steady at the
// target, with one dip when the network dropped.
const BITRATE = [
  { kbps: 6010, time: "0:00" },
  { kbps: 5980, time: "0:05" },
  { kbps: 6040, time: "0:10" },
  { kbps: 5990, time: "0:15" },
  { kbps: 6020, time: "0:20" },
  { kbps: 5210, time: "0:25" },
  { kbps: 3870, time: "0:30" },
  { kbps: 4960, time: "0:35" },
  { kbps: 5940, time: "0:40" },
  { kbps: 6010, time: "0:45" },
  { kbps: 6030, time: "0:50" },
  { kbps: 6000, time: "0:55" },
];

// Neutral: the chrome is monochrome, and a steady stream is nothing to flag.
const config = {
  kbps: { color: "var(--foreground)", label: "Bitrate (kbps)" },
} satisfies ChartConfig;

const ChartDemo = () => (
  <ChartContainer className="aspect-auto h-56 w-full max-w-lg" config={config}>
    <AreaChart data={BITRATE} margin={{ left: 0, right: 8, top: 8 }}>
      <CartesianGrid vertical={false} />
      <XAxis axisLine={false} dataKey="time" tickLine={false} tickMargin={8} />
      <YAxis
        axisLine={false}
        domain={[0, 8000]}
        tickFormatter={(value: number) => `${value / 1000}K`}
        tickLine={false}
        ticks={[0, 2000, 4000, 6000, 8000]}
        width={32}
      />
      <ChartTooltip
        content={<ChartTooltipContent indicator="line" />}
        cursor={false}
      />
      <ReferenceLine
        label={{
          fill: "var(--muted-foreground)",
          position: "insideBottomLeft",
          value: "Target",
        }}
        y={TARGET_KBPS}
      />
      <Area
        dataKey="kbps"
        fill="var(--color-kbps)"
        fillOpacity={0.1}
        stroke="var(--color-kbps)"
        strokeWidth={2}
        type="monotone"
      />
    </AreaChart>
  </ChartContainer>
);

export default ChartDemo;
