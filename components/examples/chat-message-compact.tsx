"use client";

import { ChatMessage } from "@/components/blocks/stream-manager/chat-message";
import type { ChatMessageData } from "@/components/blocks/stream-manager/chat-message";

const MESSAGES: ChatMessageData[] = [
  {
    authorName: "Maya Chen",
    id: "c1",
    platform: "youtube",
    text: "Which microphone are you using on stream today?",
    time: "8:41 PM",
  },
  {
    authorName: "nightowl_jonas",
    authorRoles: ["member"],
    id: "c2",
    platform: "twitch",
    text: "The new two-camera scene looks so clean.",
    time: "8:42 PM",
  },
  {
    authorName: "Priya Raman",
    id: "c3",
    platform: "x",
    text: "Watching from Lisbon.",
    time: "8:42 PM",
  },
];

const ChatMessageCompact = () => (
  <ol
    aria-label="Chat messages"
    className="flex w-full max-w-sm flex-col gap-1"
  >
    {MESSAGES.map((message) => (
      <ChatMessage density="compact" key={message.id} message={message} />
    ))}
  </ol>
);

export default ChatMessageCompact;
