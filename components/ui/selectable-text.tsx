import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

/** Pointer-selectable copy (`select-text`). Use for values a streamer may copy. */
function SelectableText({ className, ...props }: ComponentProps<"span">) {
  return (
    <span
      className={cn("select-text", className)}
      data-slot="selectable-text"
      {...props}
    />
  );
}

export { SelectableText };
