"use client";

import {
  ActivityFeed,
  activityCapabilityNote,
} from "@/components/blocks/stream-manager/activity-feed";
import type { ChatPlatform } from "@/components/blocks/stream-manager/chat-platform";

const PLATFORMS: ChatPlatform[] = ["youtube", "twitch", "x"];

const ActivityFeedEmpty = () => (
  <div className="rounded-panel bg-glass-content flex h-72 w-full max-w-md flex-col overflow-hidden border">
    <ActivityFeed
      note={activityCapabilityNote(PLATFORMS, { twitchNeedsFollowNames: true })}
      onReconnectTwitch={() => null}
      platforms={PLATFORMS}
      twitchNeeds={{ followNames: true }}
    />
  </div>
);

export default ActivityFeedEmpty;
