"use client";

import { useState } from "react";

import { PinWindowButton } from "@/components/pin-window-button";
import { StatusBar } from "@/components/status-bar";
import { Badge } from "@/components/ui/badge";
import { WindowFrame, WindowHeader } from "@/components/window-frame";

const MESSAGES = [
  { author: "nightowl", id: 1, text: "What camera is that?" },
  { author: "maya_streams", id: 2, text: "Hi from Lisbon!" },
  { author: "jonas", id: 3, text: "The new overlay looks great." },
] as const;

// Stand-ins for the macOS traffic lights, which the OS draws in a real window.
const TrafficLights = () => (
  <div aria-hidden className="absolute top-3.5 left-5 flex gap-2">
    <span className="bg-foreground/20 size-3 rounded-full" />
    <span className="bg-foreground/20 size-3 rounded-full" />
    <span className="bg-foreground/20 size-3 rounded-full" />
  </div>
);

const WindowFrameDemo = () => {
  const [pinned, setPinned] = useState(false);
  return (
    <WindowFrame className="rounded-panel relative flex h-72 w-full max-w-xl flex-col overflow-hidden border">
      <TrafficLights />
      <WindowHeader platform="darwin" title="Stream Manager" />
      <ol
        aria-label="Chat"
        className="px-gutter flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto py-3 text-sm select-text"
      >
        {MESSAGES.map((message) => (
          <li key={message.id}>
            <span className="text-muted-foreground font-medium">
              {message.author}
            </span>{" "}
            {message.text}
          </li>
        ))}
      </ol>
      <StatusBar leading={<Badge variant="live">On air</Badge>}>
        <PinWindowButton
          onPinnedChange={setPinned}
          pinned={pinned}
          variant="status-bar"
        />
      </StatusBar>
    </WindowFrame>
  );
};

export default WindowFrameDemo;
