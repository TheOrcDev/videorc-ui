"use client";

import { SpeakerOnIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const SOUNDS = ["Applause", "Drum roll", "Air horn", "Rimshot"] as const;

const PopoverAnchorExample = () => (
  <Popover>
    <div className="w-full max-w-md">
      <PopoverAnchor>
        <div className="h-status-bar rounded-row flex items-center justify-between border px-2">
          <span className="text-meta text-muted-foreground">On air 12:04</span>
          <PopoverTrigger render={<Button size="xs" variant="ghost" />}>
            <SpeakerOnIcon data-icon="inline-start" />
            Sounds
          </PopoverTrigger>
        </div>
      </PopoverAnchor>
    </div>
    <PopoverContent align="end" side="top">
      <div className="grid grid-cols-2 gap-1">
        {SOUNDS.map((sound) => (
          <Button key={sound} variant="ghost">
            {sound}
          </Button>
        ))}
      </div>
    </PopoverContent>
  </Popover>
);

export default PopoverAnchorExample;
