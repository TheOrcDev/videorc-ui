"use client";

import {
  DeleteIcon,
  EditIcon,
  FolderIcon,
  SceneIcon,
} from "@/components/icons";
import { KebabContextMenu } from "@/components/kebab-context-menu";
import { KebabMenu } from "@/components/kebab-menu";
import type { KebabMenuItem } from "@/components/kebab-menu";
import { ShortcutKeys } from "@/components/ui/shortcut-keys";

const noop = () => {
  // A demo: the actions do nothing.
};

// One list for both menus, so the ⋯ and the right-click never disagree.
const ITEMS: KebabMenuItem[] = [
  {
    icon: EditIcon,
    id: "rename",
    label: "Rename…",
    onSelect: noop,
    shortcut: <ShortcutKeys accelerator="Enter" />,
  },
  { icon: FolderIcon, id: "reveal", label: "Show in Finder", onSelect: noop },
  {
    destructive: true,
    icon: DeleteIcon,
    id: "delete",
    label: "Delete scene…",
    onSelect: noop,
  },
];

const KebabContextMenuDemo = () => (
  <KebabContextMenu items={ITEMS}>
    <div className="group/kebab-host rounded-row h-row flex w-full max-w-sm items-center gap-2 border pr-1 pl-3 text-sm">
      <SceneIcon aria-hidden className="text-muted-foreground size-4" />
      <span className="flex-1">Screen + camera</span>
      <span className="text-subtle text-meta">Right-click</span>
      <KebabMenu items={ITEMS} label="Actions for Screen + camera" />
    </div>
  </KebabContextMenu>
);

export default KebabContextMenuDemo;
