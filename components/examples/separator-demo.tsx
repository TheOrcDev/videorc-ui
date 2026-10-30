"use client";

import { Separator } from "@/components/ui/separator";

const SeparatorDemo = () => (
  <div className="w-full max-w-xs text-sm">
    <p className="font-medium">Livestream</p>
    <p className="text-muted-foreground">
      Go live to YouTube, Twitch and X at once.
    </p>
    <Separator className="my-3" />
    <div className="flex h-5 items-center gap-3">
      <span>Studio</span>
      <Separator orientation="vertical" />
      <span>Sources</span>
      <Separator orientation="vertical" />
      <span>Library</span>
    </div>
  </div>
);

export default SeparatorDemo;
