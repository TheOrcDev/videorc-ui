import type { ReactElement, ReactNode } from "react";

import { cn } from "@/lib/utils";

/** Twin of kit `ShortcutRecorder`: 176 px input-group shell for key chips. */
export function ShortcutRecorder({
  armed,
  invalid,
  children,
  className,
}: {
  armed?: boolean;
  invalid?: boolean;
  children?: ReactNode;
  className?: string;
}): ReactElement {
  return (
    <div
      className={cn(
        "bg-input/50 flex h-control w-44 shrink-0 items-center overflow-hidden rounded-chip border border-transparent",
        armed && "border-ring ring-ring/30 ring-3",
        invalid && !armed && "border-destructive",
        className
      )}
      data-slot="shortcut-recorder"
    >
      <div className="flex min-w-0 flex-1 items-center gap-1.5 px-2.5 text-xs">
        {children}
      </div>
    </div>
  );
}
