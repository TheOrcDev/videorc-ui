"use client";

import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";
import type {
  ButtonHTMLAttributes,
  CSSProperties,
  HTMLAttributes,
  ReactNode,
} from "react";

import { cn } from "@/lib/utils";

/**
 * Audiocn-style sound pads. Electron's full twin (hotkey grid, frame
 * progress) lives in the desktop app; this registry copy is the React
 * flavour the GPUI twin checks against (variants + sizes).
 */
export type SoundPadMode = "one-shot" | "toggle" | "hold" | "loop";

const soundPadVariants = cva(
  "relative flex flex-col items-start justify-between gap-2 overflow-hidden rounded-xl p-3 text-left outline-none select-none",
  {
    defaultVariants: { size: "default", variant: "default" },
    variants: {
      size: {
        default: "min-h-24",
        lg: "min-h-32 p-4",
        sm: "min-h-16 p-2",
      },
      variant: {
        default: "bg-muted",
        ghost: "hover:bg-muted",
        outline: "hover:bg-muted border bg-transparent",
      },
    },
  }
);

export interface SoundPadProps
  extends
    ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof soundPadVariants> {
  playing?: boolean;
  mode?: SoundPadMode;
  hotkey?: string;
  loading?: boolean;
  progress?: number;
  progressVariant?: "bar" | "fill" | "ring";
  onTrigger?: () => void;
  onStop?: () => void;
  children?: ReactNode;
}

export function SoundPad({
  playing = false,
  mode = "one-shot",
  hotkey,
  loading = false,
  progress,
  progressVariant = "ring",
  variant = "default",
  size = "default",
  disabled,
  className,
  onTrigger,
  onStop,
  children,
  ...props
}: SoundPadProps) {
  const inactive = Boolean(disabled || loading);
  const stops = playing && (mode === "toggle" || mode === "loop");

  return (
    <button
      aria-keyshortcuts={hotkey}
      aria-pressed={mode === "toggle" || mode === "loop" ? playing : undefined}
      className={cn(
        soundPadVariants({ size, variant }),
        playing && "ring-primary ring-2",
        className
      )}
      data-loading={loading ? "" : undefined}
      data-mode={mode}
      data-playing={playing ? "" : undefined}
      data-slot="sound-pad"
      disabled={inactive}
      type="button"
      onClick={() => {
        if (stops) {
          onStop?.();
        } else {
          onTrigger?.();
        }
      }}
      {...props}
    >
      {children}
      {hotkey ? (
        <kbd
          className="bg-muted absolute top-2 right-2 rounded px-1 text-[11px] font-medium uppercase"
          data-slot="sound-pad-shortcut"
        >
          {hotkey}
        </kbd>
      ) : null}
      {playing && progress !== undefined ? (
        <SoundPadProgress value={progress} variant={progressVariant} />
      ) : null}
    </button>
  );
}

export function SoundPadGrid({
  columns = 4,
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement> & { columns?: number }) {
  return (
    <div
      className={cn("flex flex-wrap gap-2", className)}
      data-columns={columns}
      data-slot="sound-pad-grid"
      role="group"
      {...props}
    >
      {children}
    </div>
  );
}

export function SoundPadLabel({
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "relative mt-auto line-clamp-2 text-sm font-medium",
        className
      )}
      data-slot="sound-pad-label"
      {...props}
    />
  );
}

export function SoundPadProgress({
  value = 0,
  variant = "ring",
  className,
}: {
  value?: number;
  variant?: "bar" | "fill" | "ring";
  className?: string;
}) {
  const progress = Math.min(1, Math.max(0, value));
  if (variant === "ring") {
    const style = {
      "--pad-progress-deg": `${progress * 360}deg`,
    } as CSSProperties;
    return (
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute right-2 bottom-2 size-5 rounded-full bg-[conic-gradient(var(--primary)_var(--pad-progress-deg),color-mix(in_oklch,var(--primary)_20%,transparent)_0)] [mask:radial-gradient(farthest-side,transparent_calc(100%-3px),black_calc(100%-3px))]",
          className
        )}
        data-slot="sound-pad-progress"
        data-variant={variant}
        style={style}
      />
    );
  }
  if (variant === "fill") {
    const style = {
      "--pad-progress": progress,
    } as CSSProperties;
    return (
      <div
        aria-hidden
        className={cn(
          "bg-primary/20 pointer-events-none absolute inset-0 opacity-(--pad-progress)",
          className
        )}
        data-slot="sound-pad-progress"
        data-variant={variant}
        style={style}
      />
    );
  }
  const style = {
    "--pad-progress": progress,
  } as CSSProperties;
  return (
    <div
      aria-hidden
      className={cn(
        "bg-primary pointer-events-none absolute inset-x-0 bottom-0 h-1 origin-left scale-x-(--pad-progress)",
        className
      )}
      data-slot="sound-pad-progress"
      data-variant={variant}
      style={style}
    />
  );
}

export { soundPadVariants };
