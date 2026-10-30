"use client";

import { useState } from "react";

import { PinWindowButton } from "@/components/pin-window-button";
import { Badge } from "@/components/ui/badge";
import { WindowFrame, WindowHeader } from "@/components/window-frame";

const LINES = [
  "Welcome back, everyone.",
  "Today we're building a scene for a two-camera podcast.",
  "First, add both cameras in Sources.",
] as const;

const WindowFrameHeader = () => {
  const [pinned, setPinned] = useState(true);
  return (
    <WindowFrame className="rounded-panel flex h-56 w-full max-w-md flex-col overflow-hidden border">
      <WindowHeader
        meta={<Badge variant="success">Listening</Badge>}
        platform="win32"
        title="Captions"
      >
        <PinWindowButton onPinnedChange={setPinned} pinned={pinned} />
      </WindowHeader>
      <div className="px-gutter flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto py-3 text-sm select-text">
        {LINES.map((line) => (
          <p key={line}>{line}</p>
        ))}
      </div>
    </WindowFrame>
  );
};

export default WindowFrameHeader;
