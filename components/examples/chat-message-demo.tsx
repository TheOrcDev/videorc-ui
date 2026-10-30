"use client";

import { useState } from "react";

import { ChatMessage } from "@/components/blocks/stream-manager/chat-message";
import type { ChatMessageData } from "@/components/blocks/stream-manager/chat-message";

const MESSAGES: ChatMessageData[] = [
  {
    authorName: "Maya Chen",
    id: "m1",
    platform: "youtube",
    text: "Which microphone are you using on stream today?",
    time: "8:41 PM",
  },
  {
    authorName: "nightowl_jonas",
    authorRoles: ["member"],
    id: "m2",
    platform: "twitch",
    text: "The new two-camera scene looks so clean.",
    time: "8:42 PM",
  },
  {
    authorName: "Priya Raman",
    id: "m3",
    platform: "x",
    text: "Watching from Lisbon. Audio is perfectly in sync!",
    time: "8:42 PM",
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
