"use client";

import { forwardRef, useImperativeHandle, useRef } from "react";
import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export interface LiveWaveformHandle {
  /** Paint one analyser snapshot without scheduling a React render. */
  paint: (levels: ArrayLike<number>, start?: number, length?: number) => void;
}

/**
 * Waveform painter for mic preview. Electron's twin owns the canvas paint
 * path in the desktop app; this registry copy is the React flavour the GPUI
 * twin checks against. Levels arrive through the imperative handle.
 */
export type LiveWaveformProps = HTMLAttributes<HTMLDivElement> & {
  active?: boolean;
  processing?: boolean;
  height?: string | number;
};

export const LiveWaveform = forwardRef<LiveWaveformHandle, LiveWaveformProps>(
  (
    { active = false, processing = false, height = 64, className, ...props },
    forwardedRef
  ) => {
    const levelsRef = useRef<ArrayLike<number>>([]);

    useImperativeHandle(
      forwardedRef,
      () => ({
        paint: (levels, start, length) => {
          levelsRef.current = levels;
          void (start ?? 0);
          void (length ?? levels.length);
        },
      }),
      []
    );

    let ariaLabel = "Audio waveform idle";
    if (active) {
      ariaLabel = "Live audio waveform";
    } else if (processing) {
      ariaLabel = "Preparing audio preview";
    }

    const heightStyle = typeof height === "number" ? `${height}px` : height;

    return (
      <div
        aria-label={ariaLabel}
        className={cn("relative h-(--waveform-height) w-full", className)}
        data-slot="live-waveform"
        role="img"
        style={
          {
            "--waveform-height": heightStyle,
          } as React.CSSProperties
        }
        {...props}
      >
        {!active && !processing ? (
          <div
            aria-hidden
            className="border-muted-foreground/20 absolute top-1/2 right-0 left-0 h-0.5 -translate-y-1/2 border-t-2 border-dotted"
          />
        ) : null}
      </div>
    );
  }
);

LiveWaveform.displayName = "LiveWaveform";
