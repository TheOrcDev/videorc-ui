"use client";

import { useState } from "react";

import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";

const STATS = [
  { id: "viewers", label: "Viewers" },
  { id: "bitrate", label: "Bitrate" },
  { id: "dropped", label: "Dropped frames" },
  { id: "uptime", label: "Uptime" },
] as const;

type StatId = (typeof STATS)[number]["id"];

const DEFAULT_STATS: StatId[] = ["viewers", "bitrate", "uptime"];

const ContextMenuCheckboxes = () => {
  const [shown, setShown] = useState<StatId[]>(DEFAULT_STATS);
  const toggle = (id: StatId, checked: boolean) =>
    setShown((current) =>
      checked ? [...current, id] : current.filter((entry) => entry !== id)
    );
  return (
    <ContextMenu>
      <ContextMenuTrigger className="w-full max-w-md">
        <div className="h-status-bar rounded-row text-meta text-muted-foreground flex items-center gap-4 border px-3">
          {STATS.filter((stat) => shown.includes(stat.id)).map((stat) => (
            <span key={stat.id}>{stat.label}</span>
          ))}
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-52">
        <ContextMenuGroup>
          <ContextMenuLabel>Stats</ContextMenuLabel>
          {STATS.map((stat) => (
            <ContextMenuCheckboxItem
              checked={shown.includes(stat.id)}
              key={stat.id}
              onCheckedChange={(checked) => toggle(stat.id, checked)}
            >
              {stat.label}
            </ContextMenuCheckboxItem>
          ))}
        </ContextMenuGroup>
        <ContextMenuSeparator />
        <ContextMenuItem onClick={() => setShown(DEFAULT_STATS)}>
          Reset stats
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};

export default ContextMenuCheckboxes;
