"use client";

import { useState } from "react";

import type { ChatDestination } from "@/components/blocks/stream-manager/chat-platform";
import { StreamManagerStatusBar } from "@/components/blocks/stream-manager/stream-manager-status-bar";
import { DEFAULT_STATS_LAYOUT } from "@/components/blocks/stream-manager/stream-stats-bar";
import type { StatsLayout } from "@/components/blocks/stream-manager/stream-stats-bar";

const DESTINATIONS: ChatDestination[] = [
  { id: "yt", platform: "youtube", state: "connected", write: "ready" },
  {
    id: "tw",
    message: "Twitch chat is reconnecting. Messages wait until it's back.",
    platform: "twitch",
    state: "reconnecting",
    write: "ready",
  },
  { id: "x", platform: "x", state: "connected", write: "read-only" },
];

const StreamManagerStatusBarNarrow = () => {
  const [pinned, setPinned] = useState(false);
  const [layout, setLayout] = useState<StatsLayout>(DEFAULT_STATS_LAYOUT);
  return (
    <div className="rounded-panel bg-glass-content @container/stream-manager flex h-32 w-full max-w-sm flex-col justify-end overflow-hidden border">
      <StreamManagerStatusBar
        destinations={DESTINATIONS}
        onClear={() => null}
        onMarkClip={() => null}
        onOpenPreview={() => null}
        onPinnedChange={setPinned}
        onSearchChat={() => null}
        onStatsLayoutChange={setLayout}
        onWriteInChat={() => null}
        pinned={pinned}
        statsLayout={layout}
      />
    </div>
  );
};

export default StreamManagerStatusBarNarrow;
