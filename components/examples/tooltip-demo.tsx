"use client";

import { NoteIcon, PinIcon, PreviewIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const TOOLS = [
  { icon: PreviewIcon, label: "Preview" },
  { icon: NoteIcon, label: "Notes" },
  { icon: PinIcon, label: "Keep on top" },
] as const;

const TooltipDemo = () => (
  <div className="flex items-center gap-1">
    {TOOLS.map(({ icon: Icon, label }) => (
      <Tooltip key={label}>
        <TooltipTrigger
          render={<Button aria-label={label} size="icon" variant="ghost" />}
        >
          <Icon />
        </TooltipTrigger>
        <TooltipContent>{label}</TooltipContent>
      </Tooltip>
    ))}
  </div>
);

export default TooltipDemo;
