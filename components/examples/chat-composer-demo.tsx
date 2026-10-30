"use client";

import { useEffect, useState } from "react";

import { ChatComposer } from "@/components/blocks/stream-manager/chat-composer";
import type { ChatComposerCommand } from "@/components/blocks/stream-manager/chat-composer";
import type { ChatDestination } from "@/components/blocks/stream-manager/chat-platform";

const DESTINATIONS: ChatDestination[] = [
  {
    accountLabel: "Night Owl Studio",
    id: "yt",
    platform: "youtube",
    state: "connected",
    write: "ready",
  },
  {
    accountLabel: "nightowlstudio",
    id: "tw",
    platform: "twitch",
    state: "connected",
    write: "ready",
  },
  { id: "x", platform: "x", state: "connected", write: "read-only" },
];

const COMMANDS: ChatComposerCommand[] = [
  {
    argument: true,
    hint: " [title] · Save a timeline point",
    value: "/marker",
  },
  { hint: " · Save the last 30 seconds as a clip", value: "/clip" },
  { hint: " · Save the last minute as a clip", value: "/clip 60" },
  { hint: " · Command help", value: "/help" },
];

const SEND_TIME_MS = 900;

const ChatComposerDemo = () => {
  const [pending, setPending] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  useEffect(() => {
    if (!pending) {
      return;
    }
    const timer = setTimeout(() => setPending(false), SEND_TIME_MS);
    return () => clearTimeout(timer);
  }, [pending]);
  return (
    <div className="rounded-panel bg-glass-content w-full max-w-2xl overflow-hidden border">
      <ChatComposer
        commands={COMMANDS}
        destinations={DESTINATIONS}
        notice={notice}
        onCommand={(command) =>
          setNotice(
            command.startsWith("/marker")
              ? `Marker saved at 30:44 · ${command.slice(8).trim() || "Untitled marker"}`
              : "Saving the last 30 seconds as a clip…"
          )
        }
        onSend={() => {
          setNotice(null);
          setPending(true);
        }}
        pending={pending}
        placeholder="Message, /marker [title] or /clip…"
      />
    </div>
  );
};

export default ChatComposerDemo;
