"use client";

import { useState } from "react";

import { ClipIcon, PauseIcon, PreviewIcon } from "@/components/icons";
import { StatusBar } from "@/components/status-bar";
import { StatusBarAction } from "@/components/status-bar-action";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const LENGTHS = ["15", "30", "60"] as const;

const StatusBarActionDemo = () => {
  const [paused, setPaused] = useState(false);
  const [length, setLength] = useState<string>("30");
  const [clips, setClips] = useState(0);
  return (
    <div className="bg-glass-content rounded-panel flex w-full max-w-xl flex-col overflow-hidden border">
      <p
        aria-live="polite"
        className="px-gutter text-muted-foreground py-6 text-sm"
      >
        {clips > 0
          ? `Saved ${clips === 1 ? "a clip" : `${clips} clips`} of the last ${length} seconds to Library.`
          : "Chat from YouTube and Twitch shows up here while you're live."}
      </p>
      <StatusBar leading="2 destinations">
        <StatusBarAction
          accelerator="CmdOrCtrl+Shift+C"
          hint={`Save the last ${length} seconds to Library`}
          icon={<ClipIcon aria-hidden />}
          label="Save a clip"
          onClick={() => setClips((count) => count + 1)}
          text="Clip"
        />
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <StatusBarAction label="Clip length" text={`${length} s`} />
            }
          />
          <DropdownMenuContent align="end" className="w-40" side="top">
            <DropdownMenuLabel>Clip length</DropdownMenuLabel>
            <DropdownMenuRadioGroup
              onValueChange={(value: string) => setLength(value)}
              value={length}
            >
              {LENGTHS.map((seconds) => (
                <DropdownMenuRadioItem key={seconds} value={seconds}>
                  {seconds} seconds
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
        <StatusBarAction
          icon={<PauseIcon aria-hidden />}
          label="Pause chat scrolling"
          onClick={() => setPaused((value) => !value)}
          pressed={paused}
        />
        <StatusBarAction
          icon={<PreviewIcon aria-hidden />}
          label="Open Preview"
        />
      </StatusBar>
    </div>
  );
};

export default StatusBarActionDemo;
