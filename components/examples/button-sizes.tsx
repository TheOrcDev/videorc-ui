"use client";

import { MoreIcon, SettingsIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";

const ButtonSizes = () => (
  <div className="flex flex-wrap items-center gap-2">
    <Button size="xs" variant="secondary">
      Extra small
    </Button>
    <Button variant="secondary">Default</Button>
    <Button size="lg" variant="secondary">
      Large
    </Button>
    <Button aria-label="Settings" size="icon" variant="ghost">
      <SettingsIcon />
    </Button>
    <Button aria-label="More actions" size="icon-xs" variant="ghost">
      <MoreIcon weight="bold" />
    </Button>
  </div>
);

export default ButtonSizes;
