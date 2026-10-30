"use client";

import { MoreIcon, SceneIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const SCENES = ["Just chatting", "Screen and camera", "Be right back"];

const DropdownMenuSubmenu = () => (
  <DropdownMenu>
    <DropdownMenuTrigger
      render={
        <Button aria-label="More source actions" size="icon" variant="ghost" />
      }
    >
      <MoreIcon weight="bold" />
    </DropdownMenuTrigger>
    <DropdownMenuContent className="w-52">
      <DropdownMenuItem>Rename…</DropdownMenuItem>
      <DropdownMenuSub>
        <DropdownMenuSubTrigger>
          <SceneIcon />
          Add to scene
        </DropdownMenuSubTrigger>
        <DropdownMenuSubContent>
          <DropdownMenuGroup>
            {SCENES.map((scene) => (
              <DropdownMenuItem key={scene}>{scene}</DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
        </DropdownMenuSubContent>
      </DropdownMenuSub>
      <DropdownMenuItem>Show in all scenes</DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);

export default DropdownMenuSubmenu;
