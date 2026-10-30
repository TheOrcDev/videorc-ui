"use client";

import { Progress } from "@/components/ui/progress";

const ProgressInline = () => (
  <div className="flex w-full max-w-sm items-center justify-between gap-4">
    <div className="flex flex-col">
      <span className="text-sm font-medium">Videorc 2.4</span>
      <span className="text-muted-foreground text-xs">
        Downloading the update…
      </span>
    </div>
    <Progress
      aria-label="Update download"
      className="w-32 shrink-0"
      value={64}
    />
  </div>
);

export default ProgressInline;
