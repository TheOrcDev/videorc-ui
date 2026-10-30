"use client";

import { Badge } from "@/components/ui/badge";
import { CHROME_ROW_CLASS } from "@/components/ui/chrome-row";
import { cn } from "@/lib/utils";

const ChromeRowDemo = () => (
  <ol
    aria-label="Chat messages"
    className="flex w-full max-w-sm flex-col gap-1"
  >
    <li className="rounded-row px-3 py-2 text-sm">
      <span className="text-muted-foreground font-medium">jonas</span> The new
      overlay looks great.
    </li>
    <li className={cn("rounded-row px-3 py-2 text-sm", CHROME_ROW_CLASS.live)}>
      <div className="mb-1 flex items-center gap-2">
        <span className="text-muted-foreground font-medium">nightowl</span>
        <Badge variant="chrome">On stream</Badge>
      </div>
      What camera is that?
    </li>
    <li
      className={cn("rounded-row px-3 py-2 text-sm", CHROME_ROW_CLASS.member)}
    >
      <div className="mb-1 flex items-center gap-2">
        <span className="text-muted-foreground font-medium">maya_streams</span>
        <Badge variant="plate">Member</Badge>
      </div>
      Hi from Lisbon!
    </li>
  </ol>
);

export default ChromeRowDemo;
