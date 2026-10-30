"use client";

import { useState } from "react";

import type { ChatDestination } from "@/components/blocks/stream-manager/chat-platform";
import { StreamManagerStatusBar } from "@/components/blocks/stream-manager/stream-manager-status-bar";
import type { HighlightPosition } from "@/components/blocks/stream-manager/stream-manager-status-bar";

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
  {
    accountLabel: "@nightowlstudio",
    id: "x",
    platform: "x",
    state: "connected",
    write: "read-only",
  },
];

const StreamManagerStatusBarDemo = () => {
  const [pinned, setPinned] = useState(true);
  const [position, setPosition] = useState<HighlightPosition>("bottom-left");
  const [screenHidden, setScreenHidden] = useState(false);
  const [said, setSaid] = useState("Every control says what it does on hover.");
  return (
    // The Stream Manager's container: the bar folds by its width.
    <div className="rounded-panel bg-glass-content @container/stream-manager flex h-44 w-full flex-col overflow-hidden border">
      <p
        aria-live="polite"
        className="text-meta text-muted-foreground flex flex-1 items-center justify-center px-4 text-center"
      >
        {said}
      </p>
      <StreamManagerStatusBar
        destinationNotes={{
          x: ["X live chat reads only on this stream."],
        }}
        destinations={DESTINATIONS}
        highlightPosition={position}
        onClear={() => setSaid("Chat and Activity were cleared.")}
        onFocusBuddy={() => setSaid("Buddy's pane comes forward.")}
        onHighlightPositionChange={setPosition}
        onMarkClip={(seconds) =>
          setSaid(
            seconds === 30
              ? "Saving the last 30 seconds as a clip…"
              : "Saving the last minute as a clip…"
          )
        }
        onOpenPreview={() => setSaid("The Preview window opens.")}
        onPinnedChange={setPinned}
        onScreenPrivacy={(hidden) => {
          setScreenHidden(hidden);
          setSaid(
            hidden
              ? "Your screen is hidden from viewers."
              : "Your screen shows again."
          );
        }}
        onSearchChat={() => setSaid("Chat's search takes the focus.")}
        onWriteInChat={() => setSaid("The composer takes the focus.")}
        pinned={pinned}
        screenHidden={screenHidden}
      />
    </div>
  );
};

export default StreamManagerStatusBarDemo;
