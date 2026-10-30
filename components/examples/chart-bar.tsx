"use client";

import { Bar, BarChart, LabelList, XAxis, YAxis } from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { ChartConfig } from "@/components/ui/chart";

const VIEWERS = [
  { platform: "YouTube", viewers: 128 },
  { platform: "Twitch", viewers: 86 },
  { platform: "Kick", viewers: 12 },
];

// One neutral series: the platform names on the axis carry identity.
const config = {
  viewers: { color: "var(--muted-foreground)", label: "Viewers" },
} satisfies ChartConfig;

const ChartBar = () => (
  <ChartContainer className="aspect-auto h-36 w-full max-w-md" config={config}>
    <BarChart data={VIEWERS} layout="vertical" margin={{ left: 0, right: 32 }}>
      <XAxis dataKey="viewers" hide type="number" />
      <YAxis
        axisLine={false}
        dataKey="platform"
        tickLine={false}
        type="category"
        width={64}
      />
      <ChartTooltip
        content={<ChartTooltipContent hideLabel />}
        cursor={false}
      />
      <Bar
        barSize={20}
        dataKey="viewers"
        fill="var(--color-viewers)"
        radius={[0, 4, 4, 0]}
      >
        <LabelList
          className="fill-foreground"
          dataKey="viewers"
          offset={8}
          position="right"
        />
      </Bar>
    </BarChart>
  </ChartContainer>
);

export default ChartBar;
