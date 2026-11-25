"use client";

import type { HTMLAttributes } from "react";
import { encode } from "uqr";

import { cn } from "@/lib/utils";

/**
 * Dark modules on white paper in both themes — scanners need the contrast.
 * Twin of Electron Phone Pair (`qrCodePath` + `uqr`, ECC M, border 2).
 */
export interface QrCodeProps extends HTMLAttributes<SVGSVGElement> {
  /** Payload to encode (pairing URL, etc.). */
  value: string;
}

/**
 * One SVG path for the whole code (a run per dark span) — a few hundred
 * commands instead of a DOM node per module.
 */
export function qrCodePath(text: string): { path: string; size: number } {
  const { data, size } = encode(text, { border: 2, ecc: "M" });
  let path = "";
  for (let y = 0; y < size; y += 1) {
    let x = 0;
    while (x < size) {
      if (!data[y][x]) {
        x += 1;
        continue;
      }
      let run = 1;
      while (x + run < size && data[y][x + run]) {
        run += 1;
      }
      path += `M${x} ${y}h${run}v1h-${run}z`;
      x += run;
    }
  }
  return { path, size };
}

// A QR code is content, not chrome: dark modules on light paper in both
// themes, because scanners need the contrast (the style guard allowlists it).
const QR_INK = "#000";

function QrCode({
  value,
  className,
  "aria-label": ariaLabel = "QR code",
  ...props
}: QrCodeProps) {
  const { path, size } = qrCodePath(value);
  return (
    <svg
      className={cn("rounded-row size-56 bg-white p-1", className)}
      role="img"
      shapeRendering="crispEdges"
      viewBox={`0 0 ${size} ${size}`}
      {...props}
      aria-label={ariaLabel}
    >
      <path d={path} fill={QR_INK} />
    </svg>
  );
}

export { QrCode };
