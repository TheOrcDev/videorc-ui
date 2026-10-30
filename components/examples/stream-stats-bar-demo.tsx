"use client";

import { useEffect, useState } from "react";

import {
  DEFAULT_STATS_LAYOUT,
  StreamStatsBar,
} from "@/components/blocks/stream-manager/stream-stats-bar";
import type {
  StatItem,
  StatsLayout,
} from "@/components/blocks/stream-manager/stream-stats-bar";

const STARTED_SECONDS = 30 * 60 + 44;
const SECONDS_PER_MINUTE = 60;
const SECONDS_PER_HOUR = 3600;
const TICK_MS = 1000;

/** "30:44", or "1:02:03" past the hour. */
const formatClock = (seconds: number): string => {
  const hours = Math.floor(seconds / SECONDS_PER_HOUR);
  const minutes = Math.floor((seconds % SECONDS_PER_HOUR) / SECONDS_PER_MINUTE);
  const rest = String(seconds % SECONDS_PER_MINUTE).padStart(2, "0");
  return hours > 0
    ? `${hours}:${String(minutes).padStart(2, "0")}:${rest}`
    : `${minutes}:${rest}`;
};

const statItems = (seconds: number): StatItem[] => [
  {
    badge: "live",
    description: `On air for ${formatClock(seconds)}`,
    details: [{ label: "Started", value: "8:12 PM" }],
    id: "session",
    label: "Session",
    tone: "neutral",
    value: formatClock(seconds),
  },
  {
    description: "1.2k viewers, peak 1.4k",
    details: [
      { label: "YouTube", platform: "youtube", value: "812" },
      { label: "Twitch", platform: "twitch", value: "356" },
      { label: "X", platform: "x", value: "64" },
      { label: "Peak", value: "1.4k" },
    ],
    id: "viewers",
    label: "Viewers",
    spark: [880, 940, 1010, 990, 1080, 1150, 1120, 1232],
    tone: "neutral",
    value: "1.2k",
  },
  {
    delta: "+12",
    description: "61,942 followers, +12 this stream",
    details: [
      {
        label: "YouTube subscribers",
        note: "+9 this stream",
        platform: "youtube",
        value: "48,310",
      },
      {
        label: "Twitch followers",
        note: "+3 this stream",
        platform: "twitch",
        value: "13,632",
      },
    ],
    id: "followers",
    label: "Followers",
    tone: "neutral",
    unit: "followers",
    value: "61,942",
  },
  {
    description: "8 new supporters this stream",
    details: [{ label: "New this stream", value: "8" }],
    id: "supporters",
    label: "Supporters this stream",
    tone: "neutral",
    unit: "supporters",
    value: "8",
  },
  {
    description: "Tips this stream: $20, 300 bits",
    details: [
      { label: "Super Chats (USD)", value: "$20" },
      { label: "Bits", value: "300" },
    ],
    id: "tips",
    label: "Tips this stream",
    tone: "neutral",
    value: "$20 · 300 bits",
  },
  {
    description: "22 messages a minute, 318 chatters",
    details: [
      { label: "Messages in the last minute", value: "22" },
      { label: "Chatters", value: "318" },
    ],
    id: "chat",
    label: "Chat",
    tone: "neutral",
    unit: "msg/min",
    value: "22",
  },
];

const StreamStatsBarDemo = () => {
  const [seconds, setSeconds] = useState(STARTED_SECONDS);
  const [layout, setLayout] = useState<StatsLayout>(DEFAULT_STATS_LAYOUT);
  useEffect(() => {
    const timer = setInterval(() => setSeconds((value) => value + 1), TICK_MS);
    return () => clearInterval(timer);
  }, []);
  return (
    // The Stream Manager's container: the bar's tiers follow its width.
    <div className="rounded-panel bg-glass-content @container/stream-manager w-full overflow-hidden border">
      <StreamStatsBar
        className="border-b-0"
        items={statItems(seconds)}
        layout={layout}
        onLayoutChange={setLayout}
      />
    </div>
  );
};

export default StreamStatsBarDemo;
