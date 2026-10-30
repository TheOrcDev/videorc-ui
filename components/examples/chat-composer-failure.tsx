"use client";

import { useState } from "react";

import { ChatComposer } from "@/components/blocks/stream-manager/chat-composer";
import type { ChatSendFailure } from "@/components/blocks/stream-manager/chat-composer";
import type { ChatDestination } from "@/components/blocks/stream-manager/chat-platform";

const DESTINATIONS: ChatDestination[] = [
  { id: "yt", platform: "youtube", state: "connected", write: "ready" },
  { id: "tw", platform: "twitch", state: "connected", write: "ready" },
  { id: "x", platform: "x", state: "connected", write: "read-only" },
];

const FAILURES: ChatSendFailure[] = [
  {
    destinationId: "tw",
    platform: "twitch",
    reason: "Twitch rejected this message: slow mode is on.",
  },
];

const ChatComposerFailure = () => {
  const [failures, setFailures] = useState(FAILURES);
  return (
    <div className="rounded-panel bg-glass-content w-full max-w-2xl overflow-hidden border">
      <ChatComposer
        defaultValue="Thanks for the raid, everyone!"
        destinations={DESTINATIONS}
        failures={failures}
        onRetry={() => setFailures([])}
        onSend={() => setFailures([])}
      />
    </div>
  );
};

export default ChatComposerFailure;
