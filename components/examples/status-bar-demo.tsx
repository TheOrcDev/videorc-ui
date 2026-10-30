"use client";

import { useState } from "react";

import { StatusBar, StatusBarHint } from "@/components/status-bar";

const WINDOWS = [
  { accelerator: "CmdOrCtrl+P", label: "Preview" },
  { accelerator: "CmdOrCtrl+Shift+N", label: "Notes" },
  { accelerator: "CmdOrCtrl+Shift+J", label: "Stream Manager" },
] as const;

const StatusBarDemo = () => {
  const [open, setOpen] = useState<Record<string, boolean>>({
    "Stream Manager": true,
  });
  const [searches, setSearches] = useState(0);
  const toggle = (label: string) =>
    setOpen((current) => ({ ...current, [label]: !current[label] }));
  return (
    <div className="bg-glass-content rounded-panel flex h-44 w-full max-w-xl flex-col overflow-hidden border">
      <div className="p-gutter flex min-h-0 flex-1 flex-col gap-2">
        <div className="bg-video-ground text-video-ground-muted rounded-row grid flex-1 place-items-center text-xs">
          Studio preview
        </div>
        <p aria-live="polite" className="text-meta text-muted-foreground">
          {searches > 0
            ? `Search opened ${searches === 1 ? "once" : `${searches} times`}.`
            : "Click a hint: each one is its shortcut."}
        </p>
      </div>
      <StatusBar
        leading={
          // The session's own words and its clock. In Videorc it's a button
          // that opens Health.
          <span className="text-foreground flex items-center gap-1.5">
            <span
              aria-hidden
              className="glass-dot tone-live size-1.5 rounded-full"
            />
            On air
            <span aria-hidden className="tabular-nums">
              12:04
            </span>
          </span>
        }
      >
        <StatusBarHint
          accelerator="CmdOrCtrl+K"
          label="Search"
          onClick={() => setSearches((count) => count + 1)}
        />
        {WINDOWS.map(({ accelerator, label }) => (
          <StatusBarHint
            accelerator={accelerator}
            key={label}
            label={label}
            onClick={() => toggle(label)}
            pressed={Boolean(open[label])}
          />
        ))}
      </StatusBar>
    </div>
  );
};

export default StatusBarDemo;
