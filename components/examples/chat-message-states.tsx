"use client";

import { ChatMessage } from "@/components/blocks/stream-manager/chat-message";
import type { ChatMessageProps } from "@/components/blocks/stream-manager/chat-message";

type Row = Omit<ChatMessageProps, "onHighlight"> & { highlightable?: boolean };

const ROWS: Row[] = [
  {
    highlight: { phase: "live" },
    message: {
      authorName: "Priya Raman",
      id: "on-stream",
      platform: "x",
      text: "On stream: the chrome plate with its polished edge.",
      time: "8:40 PM",
    },
  },
  {
    highlight: { phase: "applying" },
    message: {
      authorName: "Leo Park",
      id: "applying",
      platform: "youtube",
      text: "Applying: the row waits while Studio puts it on stream.",
      time: "8:40 PM",
    },
  },
  {
    highlight: {
      phase: "failed",
      reason: "Studio didn't answer. Try again.",
    },
    message: {
      authorName: "Sam Okafor",
      id: "failed",
      platform: "twitch",
      text: "Failed: the reason is the row's own line.",
      time: "8:41 PM",
    },
  },
  {
    message: {
      authorName: "nightowl_jonas",
      authorRoles: ["member"],
      id: "member",
      platform: "twitch",
      text: "A member's message wears the quieter plate with a member-hue edge.",
      time: "8:41 PM",
    },
  },
  {
    message: {
      amountText: "$5.00",
      authorName: "Maya Chen",
      id: "paid",
      kind: "paid",
      platform: "youtube",
      text: "A Super Chat: the warning fill and its hairline ring.",
      time: "8:41 PM",
    },
  },
  {
    mentionNames: ["@nightowlstudio"],
    message: {
      authorName: "kai.streams",
      firstMessage: true,
      id: "mention",
      platform: "twitch",
      text: "@nightowlstudio first time here, is this the two-camera setup?",
      time: "8:42 PM",
    },
  },
  {
    message: {
      authorName: "Ana Silva",
      authorRoles: ["moderator"],
      id: "reply",
      platform: "youtube",
      reply: {
        authorName: "Maya Chen",
        text: "Which microphone are you using?",
      },
      text: "It's the Shure MV7, he said it last week.",
      time: "8:42 PM",
    },
  },
  {
    message: {
      authorName: "Leo Park",
      id: "spotlight",
      platform: "youtube",
      text: "Buddy heard you talking about this one.",
      time: "8:43 PM",
    },
    spotlight: true,
  },
  {
    message: {
      authorName: "Hana Ito",
      id: "suggested",
      platform: "x",
      text: "This stream got me to finally set up my own studio.",
      time: "8:43 PM",
    },
    suggested: true,
  },
  {
    flag: {
      action: "Remove?",
      detail: "Buddy flagged this as spam: a link repeated in chat.",
      label: "Spam",
      severity: "high",
    },
    message: {
      authorName: "promo_bot_77",
      id: "flagged",
      platform: "twitch",
      text: "free followers at a site you've never heard of",
      time: "8:43 PM",
    },
  },
  {
    message: {
      authorName: "promo_bot_12",
      id: "removing",
      platform: "twitch",
      text: "free followers, again",
      time: "8:44 PM",
    },
    removal: { kind: "removing" },
  },
  {
    highlightable: false,
    message: {
      authorName: "promo_bot_77",
      deleted: true,
      id: "removed",
      platform: "twitch",
      text: "free followers at a site you've never heard of",
      time: "8:44 PM",
    },
    removal: { detail: "Removed by you on Twitch.", kind: "removed" },
  },
  {
    highlightable: false,
    message: {
      authorName: "Twitch",
      id: "moderation",
      kind: "moderation",
      platform: "twitch",
      text: "promo_bot_77 was timed out for 10 minutes.",
      time: "8:44 PM",
    },
  },
];

const noop = () => null;

const ChatMessageStates = () => (
  <ol
    aria-label="Chat messages"
    className="flex w-full max-w-2xl flex-col gap-1"
  >
    {ROWS.map(({ highlightable = true, ...row }) => (
      <ChatMessage
        {...row}
        key={row.message.id}
        onHighlight={highlightable ? noop : undefined}
        onRemoveFromChat={row.flag ? noop : undefined}
        onReply={noop}
      />
    ))}
  </ol>
);

export default ChatMessageStates;
