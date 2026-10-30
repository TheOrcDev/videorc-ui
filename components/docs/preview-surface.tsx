import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

/**
 * The plain surface a preview or a showcase tile draws its component on: the
 * window's tone and a hairline, nothing behind it.
 */
export const PreviewSurface = ({
  className,
  ...props
}: ComponentProps<"div">) => (
  <div
    className={cn("bg-glass-solid text-foreground relative", className)}
    data-slot="preview-surface"
    {...props}
  />
);
