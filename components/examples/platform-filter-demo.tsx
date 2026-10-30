"use client";

import { useState } from "react";

import { CHAT_PLATFORM_LABELS } from "@/components/blocks/stream-manager/chat-platform";
import { PlatformFilter } from "@/components/blocks/stream-manager/platform-filter";
import type { PlatformFilterValue } from "@/components/blocks/stream-manager/platform-filter";

const PlatformFilterDemo = () => {
  const [platform, setPlatform] = useState<PlatformFilterValue>("all");
  return (
    <div className="flex flex-col items-center gap-3">
      <PlatformFilter
        label="Show chat from"
        onValueChange={setPlatform}
        platforms={["youtube", "twitch", "x"]}
        value={platform}
      />
      <p aria-live="polite" className="text-meta text-muted-foreground">
        {platform === "all"
          ? "Chat from every platform."
          : `Only ${CHAT_PLATFORM_LABELS[platform]} chat.`}
      </p>
    </div>
  );
};

export default PlatformFilterDemo;
