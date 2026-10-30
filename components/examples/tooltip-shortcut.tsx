"use client";

import { RecordIcon, SearchIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { ShortcutKeys } from "@/components/ui/shortcut-keys";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const TooltipShortcut = () => (
  <div className="flex items-center gap-2">
    <Tooltip>
      <TooltipTrigger render={<Button variant="secondary" />}>
        <SearchIcon data-icon="inline-start" />
        Search
      </TooltipTrigger>
      <TooltipContent>
        Search Videorc
        <ShortcutKeys accelerator="CmdOrCtrl+K" />
      </TooltipContent>
    </Tooltip>
    <Tooltip>
      <TooltipTrigger render={<Button variant="record" />}>
        <RecordIcon data-icon="inline-start" weight="fill" />
        Record
      </TooltipTrigger>
      <TooltipContent side="bottom">
        Start recording
        <ShortcutKeys accelerator="CmdOrCtrl+Shift+R" />
      </TooltipContent>
    </Tooltip>
  </div>
);

export default TooltipShortcut;
