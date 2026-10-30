"use client";

import { useSyncExternalStore } from "react";
import type { CSSProperties, ReactElement } from "react";

import { cn } from "@/lib/utils";

const SERVER_DISPLAY_SIZE = "0x0";

function subscribeResize(onChange: () => void): () => void {
  window.addEventListener("resize", onChange);
  return () => window.removeEventListener("resize", onChange);
}

/**
 * The display the window is on, in CSS px, never smaller than the viewport
 * (a window can be larger than its screen). One string, so the store snapshot
 * compares by value. It re-reads on resize: a window moved to another display
 * catches up on its next resize.
 */
function displaySizeSnapshot(): string {
  const width = Math.max(window.screen?.width ?? 0, window.innerWidth);
  const height = Math.max(window.screen?.height ?? 0, window.innerHeight);
  return `${width}x${height}`;
}

const serverDisplaySize = (): string => SERVER_DISPLAY_SIZE;

// Each still is the display's size (the custom properties on the ground),
// centred on the window.
const IMAGE_CLASS =
  "absolute top-1/2 left-1/2 h-(--chrome-ground-height) w-(--chrome-ground-width) max-w-none -translate-x-1/2 -translate-y-1/2 object-cover";

interface ChromeGroundProps {
  /** The dark theme's still: black with silver streaks. */
  dark: string;
  /** The light theme's still: its crisp invert, porcelain with graphite streaks. */
  light: string;
  /** Layout only: `absolute` to hold the ground inside a container instead of the window. */
  className?: string;
}

/**
 * The chrome ground: the frosted still of Liquid Chrome every window sits
 * on, black with silver streaks in dark and its crisp invert in light.
 * Mount it once per window root, under everything.
 *
 * - Sized to the display and centred on the window: a resize shows more or
 *   less chrome and never rescales it. The still is blurred, so the upscale
 *   is invisible.
 * - Both themes' images stay mounted and the `.dark` class picks one, so a
 *   theme toggle swaps the ground in the same style pass as the coats: no
 *   frame shows the other theme's ground.
 * - The window coat is painted over the still here: the body paints the same
 *   coat, but as the canvas under this layer, where it only covers the first
 *   paint before the image decodes. The sidebar and the panes add their
 *   deltas above, so every region composites to exactly its cover.
 * - No CSS filter, transition, animation or backdrop-filter. Decoration only:
 *   hidden from assistive tech and from the pointer. The theme hides it under
 *   `prefers-reduced-transparency` (the `[data-chrome-ground]` rule).
 */
function ChromeGround({
  dark,
  light,
  className,
}: ChromeGroundProps): ReactElement {
  const size = useSyncExternalStore(
    subscribeResize,
    displaySizeSnapshot,
    serverDisplaySize
  );
  const [width, height] = size.split("x").map(Number);
  // The display's size, measured at runtime, for the stills to read.
  const displayStyle = {
    "--chrome-ground-height": `${height}px`,
    "--chrome-ground-width": `${width}px`,
  } as CSSProperties;
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none fixed inset-0 -z-10 overflow-hidden",
        className
      )}
      data-chrome-ground=""
      data-slot="chrome-ground"
      style={displayStyle}
    >
      <img
        alt=""
        className={cn(IMAGE_CLASS, "dark:hidden")}
        data-chrome-ground-image="light"
        decoding="sync"
        draggable={false}
        src={light}
      />
      <img
        alt=""
        className={cn(IMAGE_CLASS, "hidden dark:block")}
        data-chrome-ground-image="dark"
        decoding="sync"
        draggable={false}
        src={dark}
      />
      <div
        className="bg-glass-window absolute inset-0"
        data-chrome-ground-coat=""
      />
    </div>
  );
}

export { ChromeGround, type ChromeGroundProps };
