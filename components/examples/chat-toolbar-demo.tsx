"use client";

import { useState } from "react";

import { ChatMessage } from "@/components/blocks/stream-manager/chat-message";
import type { ChatMessageData } from "@/components/blocks/stream-manager/chat-message";
import {
  ChatToolbar,
  DEFAULT_CHAT_FILTER,
  filterChatMessages,
} from "@/components/blocks/stream-manager/chat-toolbar";
import type { ChatFilter } from "@/components/blocks/stream-manager/chat-toolbar";

const MESSAGES: ChatMessageData[] = [
  {
    authorName: "Maya Chen",
    id: "t1",
    platform: "youtube",
    text: "Which microphone are you using on stream today?",
    time: "8:41 PM",
  },
  {
    authorName: "nightowl_jonas",
    authorRoles: ["member"],
    id: "t2",
    platform: "twitch",
    text: "@nightowlstudio the new two-camera scene looks so clean.",
    time: "8:42 PM",
  },
  {
    authorName: "Priya Raman",
    id: "t3",
    platform: "x",
    text: "Watching from Lisbon. Audio is perfectly in sync!",
    time: "8:42 PM",
  },
];

/** Buddy's open question is about Maya's message. */
const QUESTION_IDS = new Set(["t1"]);
const MENTION_NAMES = ["@nightowlstudio"];

const ChatToolbarDemo = () => {
  const [filter, setFilter] = useState<ChatFilter>(DEFAULT_CHAT_FILTER);
  const shown = filterChatMessages(MESSAGES, filter, {
    mentionNames: MENTION_NAMES,
    questionIds: QUESTION_IDS,
  });
  return (
    <div className="rounded-panel bg-glass-content flex w-full max-w-2xl flex-col overflow-hidden border">
      <ChatToolbar
        filter={filter}
        onFilterChange={setFilter}
        platforms={["youtube", "twitch", "x"]}
        questions
      />
      <ol
        aria-label="Chat messages"
        className="flex h-56 flex-col gap-1 px-2 py-1"
      >
        {shown.map((message) => (
          <ChatMessage
            key={message.id}
            mentionNames={MENTION_NAMES}
            message={message}
          />
        ))}
        {shown.length === 0 ? (
          <li className="text-muted-foreground m-auto text-sm">
            No messages match these filters.
          </li>
        ) : null}
      </ol>
    </div>
  );
};

export default ChatToolbarDemo;
