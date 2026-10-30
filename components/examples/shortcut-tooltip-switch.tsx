"use client";

import { useState } from "react";

import { ShortcutTooltip } from "@/components/ui/shortcut-tooltip";
import { Switch } from "@/components/ui/switch";

const ShortcutTooltipSwitch = () => {
  const [live, setLive] = useState(true);
  return (
    <div className="flex items-center gap-2 text-sm">
      <ShortcutTooltip
        accelerator="CmdOrCtrl+Shift+M"
        label={live ? "Mute microphone" : "Unmute microphone"}
      >
        <Switch
          aria-label="Microphone"
          checked={live}
          onCheckedChange={setLive}
        />
      </ShortcutTooltip>
      <span aria-hidden>Microphone</span>
    </div>
  );
};

export default ShortcutTooltipSwitch;
