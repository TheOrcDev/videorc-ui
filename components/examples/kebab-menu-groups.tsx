"use client";

import { useState } from "react";

import {
  CopyIcon,
  DeleteIcon,
  EditIcon,
  MarkerIcon,
  PlayIcon,
  RepairIcon,
} from "@/components/icons";
import { KebabMenu } from "@/components/kebab-menu";
import type { KebabMenuItem } from "@/components/kebab-menu";
import { ShortcutKeys } from "@/components/ui/shortcut-keys";

const CHECK_TAKES_MS = 1500;

const noop = () => {
  // A demo: most actions do nothing.
};

const KebabMenuGroups = () => {
  const [checking, setChecking] = useState(false);
  const check = () => {
    setChecking(true);
    setTimeout(() => setChecking(false), CHECK_TAKES_MS);
  };
  const items: KebabMenuItem[] = [
    {
      group: "open",
      icon: PlayIcon,
      id: "play",
      label: "Play",
      onSelect: noop,
      shortcut: <ShortcutKeys accelerator="Space" />,
    },
    {
      group: "open",
      icon: MarkerIcon,
      id: "markers",
      label: "Show markers",
      onSelect: noop,
    },
    {
      group: "edit",
      icon: EditIcon,
      id: "rename",
      label: "Rename…",
      onSelect: noop,
      shortcut: <ShortcutKeys accelerator="Enter" />,
    },
    {
      group: "edit",
      icon: CopyIcon,
      id: "duplicate",
      label: "Duplicate",
      onSelect: noop,
    },
    {
      disabled: checking,
      disabledReason: "Wait for the check to finish.",
      group: "repair",
      icon: RepairIcon,
      id: "check",
      label: checking ? "Checking…" : "Check recording",
      onSelect: check,
    },
    {
      destructive: true,
      disabled: checking,
      disabledReason: "Wait for the check to finish.",
      icon: DeleteIcon,
      id: "delete",
      label: "Delete…",
      onSelect: noop,
    },
  ];

  return (
    <div className="flex items-center gap-3 text-sm">
      <span>Launch demo</span>
      <KebabMenu
        busy={checking}
        items={items}
        label="Actions for Launch demo"
      />
    </div>
  );
};

export default KebabMenuGroups;
