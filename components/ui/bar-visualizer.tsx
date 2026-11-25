"use client";

import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

/**
 * Level bars for mic meters. Electron's twin lives in the desktop app
 * (`apps/desktop/.../ui/bar-visualizer.tsx`); this registry copy is the
 * React flavour the GPUI twin checks against. Callers pass normalized
 * levels from a central analyser — no WebAudio here.
 */
export type AgentState =
  | "connecting"
  | "initializing"
  | "listening"
  | "speaking"
  | "thinking";

export interface BarVisualizerProps extends HTMLAttributes<HTMLDivElement> {
  state?: AgentState;
  barCount?: number;
  levels?: number[];
  minHeight?: number;
  maxHeight?: number;
  centerAlign?: boolean;
}

function heightPct(
  level: number,
  minHeight: number,
  maxHeight: number
): number {
  return Math.min(maxHeight, Math.max(minHeight, level * 100 + 5));
}

export function BarVisualizer({
  state,
  barCount = 15,
  levels,
  minHeight = 20,
  maxHeight = 100,
  centerAlign = false,
  className,
  ...props
}: BarVisualizerProps) {
  const bands = levels ?? Array.from({ length: barCount }, () => 0);
  const speaking = state === undefined || state === "speaking";

  return (
    <div
      className={cn(
        "relative flex h-16 w-full justify-center gap-1 overflow-hidden",
        centerAlign ? "items-center" : "items-end",
        className
      )}
      data-slot="bar-visualizer"
      data-state={state}
      {...props}
    >
      {bands.map((volume, index) => (
        <div
          className={cn(
            "h-(--bar-height) max-w-2 min-w-1 flex-1 rounded-full bg-current",
            speaking ? "opacity-90" : "opacity-30"
          )}
          data-slot="bar-visualizer-bar"
          key={index}
          style={
            {
              "--bar-height": `${heightPct(volume, minHeight, maxHeight)}%`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
