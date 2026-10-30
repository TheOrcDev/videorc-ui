"use client";

import {
  CHAT_PLATFORM_LABELS,
  ChatPlatformIcon,
  chatStateLabel,
} from "@/components/blocks/stream-manager/chat-platform";
import type { ChatDestination } from "@/components/blocks/stream-manager/chat-platform";

const DESTINATIONS: ChatDestination[] = [
  { id: "yt", platform: "youtube", state: "connected", write: "ready" },
  {
    id: "tw",
    platform: "twitch",
    state: "connected",
    write: "missing-scope",
  },
  { id: "x", platform: "x", state: "connected", write: "read-only" },
  { id: "tt", platform: "tiktok", state: "reconnecting" },
];

const ChatPlatformStates = () => (
  <ul className="flex w-full max-w-xs flex-col gap-2 text-sm">
    {DESTINATIONS.map((destination) => (
      <li className="flex items-center gap-2" key={destination.id}>
        <ChatPlatformIcon decorative platform={destination.platform} />
        <span className="flex-1">
          {CHAT_PLATFORM_LABELS[destination.platform]}
        </span>
        <span className="text-muted-foreground">
          {chatStateLabel(destination)}
        </span>
      </li>
    ))}
  </ul>
);

export default ChatPlatformStates;
