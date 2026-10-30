"use client";

import { MicrophoneIcon, PreviewIcon, SearchIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { ShortcutTooltip } from "@/components/ui/shortcut-tooltip";

const ShortcutTooltipDemo = () => (
  <div className="flex items-center gap-1">
    <ShortcutTooltip accelerator="CmdOrCtrl+K" label="Search">
      <Button aria-label="Search" size="icon" variant="ghost">
        <SearchIcon />
      </Button>
    </ShortcutTooltip>
    <ShortcutTooltip accelerator="CmdOrCtrl+P" label="Open Preview">
      <Button aria-label="Open Preview" size="icon" variant="ghost">
        <PreviewIcon />
      </Button>
    </ShortcutTooltip>
    <ShortcutTooltip label="Mute microphone">
      <Button aria-label="Mute microphone" size="icon" variant="ghost">
        <MicrophoneIcon />
      </Button>
    </ShortcutTooltip>
  </div>
);

export default ShortcutTooltipDemo;
