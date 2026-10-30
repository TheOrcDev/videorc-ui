"use client";

import { useState } from "react";

import { PinWindowButton } from "@/components/pin-window-button";
import { WindowHeader } from "@/components/window-frame";

const PinWindowButtonDemo = () => {
  const [pinned, setPinned] = useState(false);
  return (
    <div className="bg-glass-content rounded-panel w-full max-w-sm overflow-hidden border">
      <WindowHeader platform="linux" title="Notes">
        <PinWindowButton onPinnedChange={setPinned} pinned={pinned} />
      </WindowHeader>
      <p className="p-gutter text-muted-foreground text-sm select-text">
        {pinned
          ? "Notes stays over other apps, so it's there while you record."
          : "Pin Notes to keep it over other apps while you record."}
      </p>
    </div>
  );
};

export default PinWindowButtonDemo;
