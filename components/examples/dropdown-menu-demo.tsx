"use client";

import {
  CopyIcon,
  DeleteIcon,
  EditIcon,
  FolderIcon,
  MoreIcon,
} from "@/components/icons";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ShortcutKeys } from "@/components/ui/shortcut-keys";

const DropdownMenuDemo = () => (
  <DropdownMenu>
    <DropdownMenuTrigger
      render={<Button aria-label="More actions" size="icon" variant="ghost" />}
    >
      <MoreIcon weight="bold" />
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" className="w-52">
      <DropdownMenuGroup>
        <DropdownMenuItem>
          <EditIcon />
          Rename…
          <DropdownMenuShortcut>
            <ShortcutKeys accelerator="Enter" />
          </DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <CopyIcon />
          Duplicate
          <DropdownMenuShortcut>
            <ShortcutKeys accelerator="CmdOrCtrl+D" />
          </DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <FolderIcon />
          Show in Finder
        </DropdownMenuItem>
      </DropdownMenuGroup>
      <DropdownMenuSeparator />
      <DropdownMenuItem variant="destructive">
        <DeleteIcon />
        Delete recording…
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);

export default DropdownMenuDemo;
