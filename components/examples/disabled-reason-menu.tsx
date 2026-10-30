"use client";

import { MoreIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { DisabledReason } from "@/components/ui/disabled-reason";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const DisabledReasonMenu = () => (
  <DropdownMenu>
    <DropdownMenuTrigger
      render={
        <Button
          aria-label="Actions for Launch demo"
          size="icon"
          variant="ghost"
        />
      }
    >
      <MoreIcon weight="bold" />
    </DropdownMenuTrigger>
    <DropdownMenuContent>
      <DropdownMenuItem>Rename…</DropdownMenuItem>
      <DropdownMenuItem>Show in Finder</DropdownMenuItem>
      <DisabledReason
        focusable={false}
        reason="Wait for the upload to finish."
        side="left"
      >
        <DropdownMenuItem disabled>Delete</DropdownMenuItem>
      </DisabledReason>
    </DropdownMenuContent>
  </DropdownMenu>
);

export default DisabledReasonMenu;
