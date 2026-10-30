"use client";

import { StreamStatsBar } from "@/components/blocks/stream-manager/stream-stats-bar";
import type { StatItem } from "@/components/blocks/stream-manager/stream-stats-bar";

// Off air, nothing is measured: the clock says so, and the chat pace shows
// "–" with the reason on hover, never a zero nobody counted.
const ITEMS: StatItem[] = [
  {
    badge: "off-air",
    description: "Off air",
    details: [],
    id: "session",
    label: "Session",
    tone: "subtle",
    value: "Off air",
  },
  {
    description: "Chat isn't connected",
    details: [
      {
        label: "Messages in the last minute",
        note: "Chat isn't connected",
        value: "–",
      },
    ],
    id: "chat",
    label: "Chat",
    tone: "subtle",
    value: "–",
  },
];

const StreamStatsBarOffAir = () => (
  <div className="rounded-panel bg-glass-content @container/stream-manager w-full max-w-md overflow-hidden border">
    <StreamStatsBar className="border-b-0" items={ITEMS} screenHidden />
  </div>
);

export default StreamStatsBarOffAir;
