"use client";

import { CopyIcon, DeleteIcon, EditIcon } from "@/components/icons";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { ShortcutKeys } from "@/components/ui/shortcut-keys";

const ContextMenuDemo = () => (
  <ContextMenu>
    <ContextMenuTrigger>
      <div className="rounded-row text-muted-foreground flex h-32 w-72 items-center justify-center border text-sm">
        Right-click the scene
      </div>
    </ContextMenuTrigger>
    <ContextMenuContent className="w-52">
      <ContextMenuGroup>
        <ContextMenuItem>
          <EditIcon />
          Rename…
          <ContextMenuShortcut>
            <ShortcutKeys accelerator="Enter" />
          </ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem>
          <CopyIcon />
          Duplicate
          <ContextMenuShortcut>
            <ShortcutKeys accelerator="CmdOrCtrl+D" />
          </ContextMenuShortcut>
        </ContextMenuItem>
      </ContextMenuGroup>
      <ContextMenuSeparator />
      <ContextMenuItem variant="destructive">
        <DeleteIcon />
        Delete scene…
      </ContextMenuItem>
    </ContextMenuContent>
  </ContextMenu>
);

export default ContextMenuDemo;
