"use client";

import { useState } from "react";

import { PinWindowButton } from "@/components/pin-window-button";
import { StatusBar } from "@/components/status-bar";
import { StatusDot } from "@/components/status-dot";
import { WindowFrame, WindowHeader } from "@/components/window-frame";

const NOTES = [
  "Open with the two-camera podcast scene.",
  "Show the Shure MV7 gain staging, then the noise cleanup.",
  "Mention Thursday's livestream at 8 PM.",
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
  const [pinned, setPinned] = useState(true);
  return (
    <WindowFrame className="rounded-panel relative flex h-72 w-full max-w-xl flex-col overflow-hidden border">
      <TrafficLights />
      <WindowHeader platform="darwin" title="Notes">
        <PinWindowButton onPinnedChange={setPinned} pinned={pinned} />
      </WindowHeader>
      <ol
        aria-label="Notes for this recording"
        className="px-gutter flex min-h-0 flex-1 list-decimal flex-col gap-2 overflow-y-auto py-3 pl-9 text-sm select-text"
      >
        {NOTES.map((note) => (
          <li key={note}>{note}</li>
        ))}
      </ol>
      <StatusBar leading={<StatusDot label="Saved" tone="good" />}>
        <span className="text-subtle pr-1.5">3 notes</span>
      </StatusBar>
    </WindowFrame>
  );
};

export default WindowFrameDemo;
