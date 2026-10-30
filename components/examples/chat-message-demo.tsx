"use client";

import { useState } from "react";

import { ChatMessage } from "@/components/blocks/stream-manager/chat-message";
import type { ChatMessageData } from "@/components/blocks/stream-manager/chat-message";

// While live the rows keep their time out of sight until the pointer comes:
// these carry none at all, so the words have the room.
const MESSAGES: ChatMessageData[] = [
  {
    authorName: "Maya Chen",
    id: "m1",
    platform: "youtube",
    text: "Which microphone are you using on stream today?",
  },
  {
    authorName: "jonas",
    authorRoles: ["member"],
    id: "m2",
    platform: "twitch",
    text: "The new two-camera scene looks so clean.",
  },
  {
    authorName: "priya",
    id: "m3",
    platform: "x",
    text: "Watching from Lisbon. Audio is perfectly in sync!",
  },
];

const ChatMessageDemo = () => {
  const [onStream, setOnStream] = useState<string | null>("m3");
  return (
    <ol
      aria-label="Chat messages"
      className="flex w-full max-w-2xl flex-col gap-1"
    >
      {MESSAGES.map((message) => (
        <ChatMessage
          highlight={{ phase: message.id === onStream ? "live" : "idle" }}
          key={message.id}
          message={message}
          onHighlight={(target) =>
            setOnStream((current) => (current === target.id ? null : target.id))
          }
          onReply={() => null}
        />
      ))}
    </ol>
  );
};

export default ChatMessageDemo;
