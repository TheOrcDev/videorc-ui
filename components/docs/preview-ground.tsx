import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

/**
 * A Videorc window's ground for the docs: the frosted Liquid Chrome still
 * under the window coat, as `ChromeGround` paints it in the app. Videorc's
 * surfaces are tuned to sit on it, so every preview and tile does.
 */
export const PreviewGround = ({
  className,
  children,
  ...props
}: ComponentProps<"div">) => (
  <div
    className={cn("relative isolate overflow-hidden", className)}
    data-slot="preview-ground"
    {...props}
  >
    <div
      aria-hidden
      className="bg-chrome-ground absolute inset-0 -z-20 bg-cover bg-center"
    />
    <div aria-hidden className="bg-glass-window absolute inset-0 -z-10" />
    {children}
  </div>
);
