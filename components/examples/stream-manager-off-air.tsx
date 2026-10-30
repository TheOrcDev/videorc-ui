"use client";

import type { ChatMessageData } from "@/components/blocks/stream-manager/chat-message";
import type { ChatDestination } from "@/components/blocks/stream-manager/chat-platform";
import { StreamManager } from "@/components/blocks/stream-manager/stream-manager";
import type { StatItem } from "@/components/blocks/stream-manager/stream-stats-bar";

const STATS: StatItem[] = [
  {
    badge: "history",
    description: "History: Building a two-camera podcast scene, Oct 29",
    details: [{ label: "Title", value: "Building a two-camera podcast scene" }],
    id: "session",
    label: "Session",
    tone: "neutral",
    value: "Oct 29",
  },
  {
    description: "Peak 1.4k viewers, average 1.1k",
    details: [
      { label: "Peak", value: "1.4k" },
      { label: "Average", value: "1.1k" },
    ],
    id: "viewers",
    label: "Viewers",
    tone: "neutral",
    unit: "peak",
    value: "1.4k",
  },
  {
    description: "2,318 messages, 412 chatters",
    details: [{ label: "Chatters", value: "412" }],
    id: "chat",
    label: "Chat",
    tone: "neutral",
    unit: "messages",
    value: "2,318",
  },
];

const DESTINATIONS: ChatDestination[] = [
  { id: "yt", platform: "youtube", state: "ended", write: "ready" },
  { id: "tw", platform: "twitch", state: "ended", write: "ready" },
];

const MESSAGES: ChatMessageData[] = [
  {
    authorName: "Maya Chen",
    id: "h1",
    platform: "youtube",
    text: "Which microphone are you using on stream today?",
    time: "8:39 PM",
  },
  {
    authorName: "nightowl_jonas",
    authorRoles: ["member"],
    id: "h2",
    platform: "twitch",
    text: "Great stream, see you Thursday!",
    time: "9:58 PM",
  },
];

const StreamManagerOffAir = () => (
  <StreamManager
    className="rounded-panel h-[26rem] w-full border"
    destinations={DESTINATIONS}
    history={{
      date: "Oct 29",
      onBackToLive: () => null,
      title: "Building a two-camera podcast scene",
    }}
    messages={MESSAGES}
    platform="win32"
    stats={STATS}
  />
);

export default StreamManagerOffAir;
