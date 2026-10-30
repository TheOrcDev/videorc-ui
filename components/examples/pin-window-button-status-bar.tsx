"use client";

import { useState } from "react";

import { PinWindowButton } from "@/components/pin-window-button";
import { StatusBar } from "@/components/status-bar";

const PinWindowButtonStatusBar = () => {
  const [pinned, setPinned] = useState(true);
  return (
    <div className="bg-glass-content rounded-panel w-full max-w-sm overflow-hidden border">
      <StatusBar leading="Stream Manager">
        <PinWindowButton
          onPinnedChange={setPinned}
          pinned={pinned}
          variant="status-bar"
        />
      </StatusBar>
    </div>
  );
};

export default PinWindowButtonStatusBar;
