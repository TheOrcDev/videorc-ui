"use client";

import {
  CHAT_PLATFORM_LABELS,
  ChatPlatformIcon,
} from "@/components/blocks/stream-manager/chat-platform";
import type { ChatPlatform } from "@/components/blocks/stream-manager/chat-platform";

const PLATFORMS: ChatPlatform[] = [
  "youtube",
  "twitch",
  "x",
  "tiktok",
  "instagram",
  "facebook",
  "custom",
];

const ChatPlatformDemo = () => (
  <ul className="flex flex-wrap items-center gap-x-5 gap-y-3">
    {PLATFORMS.map((platform) => (
      <li className="flex items-center gap-2 text-sm" key={platform}>
        <ChatPlatformIcon decorative platform={platform} />
        {CHAT_PLATFORM_LABELS[platform]}
      </li>
    ))}
  </ul>
);

export default ChatPlatformDemo;
