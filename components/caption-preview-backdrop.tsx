import type { ReactElement } from "react";

import { cn } from "@/lib/utils";

export type CaptionPreviewBackdropKind = "light" | "dark" | "mixed";

/** Twin of kit caption preview surfaces (Electron caption-preview gradients). */
export function CaptionPreviewBackdrop({
  kind = "light",
  className,
}: {
  kind?: CaptionPreviewBackdropKind;
  className?: string;
}): ReactElement {
  return (
    <div
      className={cn(
        "size-full",
        kind === "light" &&
          "bg-[linear-gradient(135deg,var(--video-ground-foreground),var(--video-ground-muted))]",
        kind === "dark" &&
          "bg-[linear-gradient(135deg,#09090b_0%,#27272a_55%,#18181b_100%)]",
        kind === "mixed" &&
          "bg-[radial-gradient(circle_at_25%_20%,#64748b_0%,transparent_32%),radial-gradient(circle_at_78%_70%,#7c3aed_0%,transparent_30%),linear-gradient(135deg,#0f172a,#334155)]",
        className
      )}
      data-slot="caption-preview-backdrop"
      data-kind={kind}
    />
  );
}
