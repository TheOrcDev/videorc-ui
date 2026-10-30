"use client";

import { useState } from "react";
import type { DragEvent, ReactElement } from "react";

import { ChatPlatformIcon } from "@/components/blocks/stream-manager/chat-platform";
import type { ChatPlatform } from "@/components/blocks/stream-manager/chat-platform";
import { StatsSparkline } from "@/components/blocks/stream-manager/stats-sparkline";
import { HiddenIcon, ViewersIcon } from "@/components/icons";
import { StatusBadge } from "@/components/status-badge";
import { Badge } from "@/components/ui/badge";
import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { cn } from "@/lib/utils";

// The Stream Manager's stats bar: one 32 px row at every width, flush under
// the title row, never tiles or cards. The three main slots (the ON AIR
// clock, viewers and followers by default) lead it and are never clipped.
// The rest follow after a hairline in a clipped, wrapping row, so a stat
// that doesn't fit drops off the end whole and nothing measures the window.
// Numbers stay monochrome and tabular; tone lives in the chip, and the ON
// AIR chip is the only emphasis. Every detail is one hover away. Drag a
// stat to move it; right-click the bar to show or hide stats.

type StatId =
  | "session"
  | "viewers"
  | "followers"
  | "supporters"
  | "tips"
  | "chat";

type StatTone = "neutral" | "subtle" | "good" | "warning" | "error";

/** The session chip: ON AIR, Recording or History. Off air has none. */
type SessionBadge = "live" | "recording" | "off-air" | "history";

/** One row of a stat's hover card. */
interface StatDetailRow {
  label: string;
  value: string;
  platform?: ChatPlatform;
  note?: string;
}

/** One stat, as plain data. A stat exists only when its source does. */
interface StatItem {
  id: StatId;
  /** The hover card's heading: "Viewers", "Followers". */
  label: string;
  /** The number, or the problem when there is one. Never an unmeasured zero: "–". */
  value: string;
  /** A short muted word after the value: "followers", "msg/min". */
  unit?: string;
  /** A signed change after the value: "+12". */
  delta?: string;
  /** `subtle` dims a reading that isn't live; `warning` and `error` tint its sparkline. */
  tone: StatTone;
  /** The session stat's chip. */
  badge?: SessionBadge;
  /** Sparkline points, oldest first: drawn at Wide only. */
  spark?: readonly number[];
  /** The hover card's rows: the per-platform split, the peak. */
  details: readonly StatDetailRow[];
  /** The whole reading in words: the screen reader's label. */
  description: string;
}

/** The streamer's order and picks. The first three in `order` are the main slots. */
interface StatsLayout {
  order: StatId[];
  hidden: StatId[];
}

/** The stats' names in the right-click menu and the status bar's ⋯ menu. */
const STAT_NAMES: Readonly<Record<StatId, string>> = {
  chat: "Chat pace",
  followers: "Followers",
  session: "Clock",
  supporters: "Subs and members",
  tips: "Tips",
  viewers: "Viewers",
};

const DEFAULT_STAT_ORDER: readonly StatId[] = [
  "session",
  "viewers",
  "followers",
  "supporters",
  "tips",
  "chat",
];

/** The first three positions are the main slots: never clipped, drawn larger. */
const MAIN_SLOTS = 3;

/** Always shown, always in the main slots: the viewer count is never hidden while live. */
const LOCKED_STATS: ReadonlySet<StatId> = new Set<StatId>([
  "session",
  "viewers",
]);

const DEFAULT_STATS_LAYOUT: StatsLayout = Object.freeze({
  hidden: [],
  order: [...DEFAULT_STAT_ORDER],
});

/** The session's stats in layout order, split into the main slots and the rest. */
function arrangeStats(
  items: readonly StatItem[],
  layout: StatsLayout = DEFAULT_STATS_LAYOUT
): { main: StatItem[]; more: StatItem[] } {
  const byId = new Map(items.map((item) => [item.id, item]));
  const hidden = new Set(layout.hidden);
  const main: StatItem[] = [];
  const more: StatItem[] = [];
  for (const [index, id] of layout.order.entries()) {
    const item = byId.get(id);
    if (item && !hidden.has(id)) {
      (index < MAIN_SLOTS ? main : more).push(item);
    }
  }
  return { main, more };
}

/** Neither the clock nor the viewer count may leave the main slots. */
function lockedInMain(order: readonly StatId[]): boolean {
  return [...LOCKED_STATS].every((id) => {
    const index = order.indexOf(id);
    return index !== -1 && index < MAIN_SLOTS;
  });
}

/**
 * Moves one stat to `toIndex`. A move that would push the clock or the
 * viewer count out of the main slots is refused: the same layout comes back.
 */
function moveStat(
  layout: StatsLayout,
  id: StatId,
  toIndex: number
): StatsLayout {
  if (!layout.order.includes(id)) {
    return layout;
  }
  const order = layout.order.filter((candidate) => candidate !== id);
  order.splice(Math.max(0, Math.min(order.length, toIndex)), 0, id);
  if (order.every((candidate, index) => candidate === layout.order[index])) {
    return layout;
  }
  return lockedInMain(order) ? { ...layout, order } : layout;
}

/** Shows or hides a stat. The clock and the viewer count can't be hidden. */
function setStatHidden(
  layout: StatsLayout,
  id: StatId,
  hidden: boolean
): StatsLayout {
  if (LOCKED_STATS.has(id)) {
    return layout;
  }
  const without = layout.hidden.filter((candidate) => candidate !== id);
  return { ...layout, hidden: hidden ? [...without, id] : without };
}

/** Whether the layout is the default one: Reset stats has nothing to do. */
function statsLayoutIsDefault(layout: StatsLayout): boolean {
  return (
    layout.hidden.length === 0 &&
    layout.order.every((id, index) => id === DEFAULT_STAT_ORDER[index])
  );
}

/** The state's one word while the screen is hidden from viewers. */
const SCREEN_HIDDEN_LABEL = "Screen hidden";

interface StatDrag {
  dragging: boolean;
  dropTarget: boolean;
  onDragStart: (event: DragEvent<HTMLElement>) => void;
  onDragOver: (event: DragEvent<HTMLElement>) => void;
  onDrop: (event: DragEvent<HTMLElement>) => void;
  onDragEnd: () => void;
}

function SessionChip({
  badge,
}: {
  badge: SessionBadge | undefined;
}): ReactElement | null {
  switch (badge) {
    case "live": {
      // Broadcast convention: the live chip is ON AIR.
      return <Badge variant="live">ON AIR</Badge>;
    }
    case "recording": {
      return <Badge>Recording</Badge>;
    }
    case "history": {
      return <Badge>History</Badge>;
    }
    default: {
      return null;
    }
  }
}

function StatLead({ item }: { item: StatItem }): ReactElement | null {
  if (item.id === "session") {
    return <SessionChip badge={item.badge} />;
  }
  if (item.id === "viewers") {
    return (
      <ViewersIcon
        aria-hidden
        className="text-muted-foreground size-4 shrink-0"
      />
    );
  }
  return null;
}

// A hover card of rows, at the menu's 8 px inset rather than the card's 12.
// oxlint-disable-next-line shadcn/no-restyle -- see above.
const DETAILS_CLASS = "w-64 p-2";

function StatDetails({ item }: { item: StatItem }): ReactElement {
  return (
    <HoverCardContent align="start" className={DETAILS_CLASS}>
      <div className="text-label text-subtle px-1 pb-1">{item.label}</div>
      <div className="flex flex-col">
        {item.details.map((row, index) => (
          <div
            className="rounded-chip flex items-center gap-2 p-1 text-xs"
            key={`${row.label}:${index}`}
          >
            {row.platform ? (
              <ChatPlatformIcon decorative platform={row.platform} />
            ) : null}
            <span className="text-muted-foreground min-w-0 flex-1 truncate">
              {row.label}
            </span>
            <span className="flex shrink-0 flex-col items-end">
              <span className="text-foreground font-medium tabular-nums">
                {row.value}
              </span>
              {row.note ? (
                <span className="text-label text-muted-foreground max-w-40 truncate font-normal">
                  {row.note}
                </span>
              ) : null}
            </span>
          </div>
        ))}
      </div>
    </HoverCardContent>
  );
}

// The main slots' numbers: 15 px, between the type scale's 14 and 16, so
// the clock and the count read first. The rest are the section size.
// oxlint-disable-next-line shadcn/no-arbitrary-values -- see above.
const MAIN_VALUE_CLASS = "text-[15px] leading-none font-semibold";
const MORE_VALUE_CLASS = "text-section font-medium";

/** A stat's number, its unit, its change and, in a main slot at Wide, its sparkline. */
function StatReading({
  item,
  main,
  shrinks,
}: {
  item: StatItem;
  main: boolean;
  shrinks: boolean;
}): ReactElement {
  const trouble = item.tone === "warning" || item.tone === "error";
  const spark = main && item.spark && item.spark.length > 1 ? item.spark : null;
  return (
    <>
      <span
        className={cn(
          "tabular-nums",
          main ? MAIN_VALUE_CLASS : MORE_VALUE_CLASS,
          item.tone === "subtle" ? "text-subtle" : "text-foreground",
          shrinks && "min-w-0 truncate"
        )}
        data-slot="stat-value"
      >
        {item.value}
      </span>
      {item.unit ? (
        <span
          className={cn(
            "text-muted-foreground",
            main ? "text-xs" : "text-section font-normal"
          )}
        >
          {item.unit}
        </span>
      ) : null}
      {item.delta ? (
        <span className="text-muted-foreground text-xs tabular-nums">
          {item.delta}
        </span>
      ) : null}
      {spark ? (
        // Sparklines are a Wide luxury; below it the number is the reading.
        <span className="hidden w-12 shrink-0 @min-[1040px]/stream-manager:block">
          <StatsSparkline
            className="h-4"
            label={item.label}
            points={spark}
            size={{ height: 16, width: 48 }}
            tone={trouble ? "warning" : "neutral"}
          />
        </span>
      ) : null}
    </>
  );
}

function StatCell({
  item,
  main,
  drag,
}: {
  item: StatItem;
  main: boolean;
  drag?: StatDrag;
}): ReactElement {
  // The clock and viewers are short. Whatever holds the third main slot can
  // grow ("61,942 followers +12"): it truncates rather than push the bar
  // past a 320 px window.
  const shrinks = main && !LOCKED_STATS.has(item.id);
  const cell = (
    <span
      aria-label={item.description}
      className={cn(
        "rounded-chip focus-visible:ring-ring/50 flex h-8 items-center gap-1.5 whitespace-nowrap outline-none focus-visible:ring-2",
        shrinks ? "min-w-0" : "shrink-0",
        drag?.dragging && "opacity-50",
        drag?.dropTarget && "bg-accent"
      )}
      data-group={main ? "main" : "more"}
      data-slot="stat-item"
      data-stat={item.id}
      data-tone={item.tone}
      draggable={drag ? true : undefined}
      onDragEnd={drag?.onDragEnd}
      onDragOver={drag?.onDragOver}
      onDragStart={drag?.onDragStart}
      onDrop={drag?.onDrop}
      role="img"
      // The details open on focus too: a stat with a hover card is a tab stop.
      // oxlint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- see above.
      tabIndex={item.details.length > 0 ? 0 : undefined}
    >
      <StatLead item={item} />
      <StatReading item={item} main={main} shrinks={shrinks} />
    </span>
  );
  if (item.details.length === 0) {
    return cell;
  }
  return (
    <HoverCard>
      <HoverCardTrigger closeDelay={80} delay={400} render={cell} />
      <StatDetails item={item} />
    </HoverCard>
  );
}

/** Drag a stat onto another to move it beside it, before or after its middle. */
function useStatDrag(
  layout: StatsLayout,
  onLayoutChange: ((layout: StatsLayout) => void) | undefined
): {
  drag: (id: StatId) => StatDrag | undefined;
  placed: (id: StatId, neighbor: StatId, after: boolean) => StatsLayout;
} {
  const [dragging, setDragging] = useState<StatId | null>(null);
  const [dropTarget, setDropTarget] = useState<{
    id: StatId;
    after: boolean;
  } | null>(null);
  const placed = (
    id: StatId,
    neighbor: StatId,
    after: boolean
  ): StatsLayout => {
    const without = layout.order.filter((candidate) => candidate !== id);
    return moveStat(layout, id, without.indexOf(neighbor) + (after ? 1 : 0));
  };
  const reset = (): void => {
    setDragging(null);
    setDropTarget(null);
  };
  const drag = (id: StatId): StatDrag | undefined =>
    onLayoutChange
      ? {
          dragging: dragging === id,
          dropTarget: dropTarget?.id === id && dragging !== id,
          onDragEnd: reset,
          onDragOver: (event) => {
            if (!dragging || dragging === id) {
              return;
            }
            event.preventDefault();
            const box = event.currentTarget.getBoundingClientRect();
            const after = event.clientX > box.left + box.width / 2;
            if (dropTarget?.id !== id || dropTarget.after !== after) {
              setDropTarget({ after, id });
            }
          },
          onDragStart: (event) => {
            event.dataTransfer.effectAllowed = "move";
            event.dataTransfer.setData("text/plain", id);
            setDragging(id);
          },
          onDrop: (event) => {
            event.preventDefault();
            if (dragging && dropTarget && dragging !== dropTarget.id) {
              const next = placed(dragging, dropTarget.id, dropTarget.after);
              if (next !== layout) {
                onLayoutChange(next);
              }
            }
            reset();
          },
        }
      : undefined;
  return { drag, placed };
}

/** The right-click menu: show or hide stats, move the one under the pointer, reset. */
function StatsMenu({
  layout,
  target,
  shown,
  placed,
  onLayoutChange,
}: {
  layout: StatsLayout;
  target: StatId | null;
  shown: readonly StatId[];
  placed: (id: StatId, neighbor: StatId, after: boolean) => StatsLayout;
  onLayoutChange: (layout: StatsLayout) => void;
}): ReactElement {
  const change = (next: StatsLayout): void => {
    if (next !== layout) {
      onLayoutChange(next);
    }
  };
  // "Move left" and "Move right" step past the neighbouring shown stat.
  const position = target ? shown.indexOf(target) : -1;
  const left = shown[position - 1];
  const right = shown[position + 1];
  const moveLeft =
    target && position > 0 && left ? placed(target, left, false) : layout;
  const moveRight =
    target && position >= 0 && right ? placed(target, right, true) : layout;
  return (
    <ContextMenuContent className="w-52">
      <ContextMenuLabel>Stats</ContextMenuLabel>
      {DEFAULT_STAT_ORDER.filter((id) => !LOCKED_STATS.has(id)).map((id) => (
        <ContextMenuCheckboxItem
          checked={!layout.hidden.includes(id)}
          key={id}
          onCheckedChange={(checked) =>
            change(setStatHidden(layout, id, !checked))
          }
        >
          {STAT_NAMES[id]}
        </ContextMenuCheckboxItem>
      ))}
      {target ? (
        <>
          <ContextMenuSeparator />
          <ContextMenuItem
            disabled={moveLeft === layout}
            onClick={() => change(moveLeft)}
          >
            Move {STAT_NAMES[target]} left
          </ContextMenuItem>
          <ContextMenuItem
            disabled={moveRight === layout}
            onClick={() => change(moveRight)}
          >
            Move {STAT_NAMES[target]} right
          </ContextMenuItem>
        </>
      ) : null}
      <ContextMenuSeparator />
      <ContextMenuItem
        disabled={statsLayoutIsDefault(layout)}
        onClick={() => change(DEFAULT_STATS_LAYOUT)}
      >
        Reset stats
      </ContextMenuItem>
      <ContextMenuLabel>Drag a stat to move it.</ContextMenuLabel>
    </ContextMenuContent>
  );
}

interface StreamStatsBarProps {
  items: readonly StatItem[];
  layout?: StatsLayout;
  /** Lets the streamer drag stats and pick them by right-click. Absent: a fixed order. */
  onLayoutChange?: (layout: StatsLayout) => void;
  /** The screen is hidden from viewers: the chip closes the bar. */
  screenHidden?: boolean;
  className?: string;
}

function StreamStatsBar({
  items,
  layout = DEFAULT_STATS_LAYOUT,
  onLayoutChange,
  screenHidden = false,
  className,
}: StreamStatsBarProps): ReactElement {
  const { main, more } = arrangeStats(items, layout);
  const [menuTarget, setMenuTarget] = useState<StatId | null>(null);
  const { drag, placed } = useStatDrag(layout, onLayoutChange);
  const shown = [...main, ...more].map((item) => item.id);

  const bar = (
    <section
      aria-label="Stream stats"
      className={cn(
        "border-border focus-visible:ring-ring/50 flex shrink-0 items-center overflow-hidden border-b px-3 outline-none focus-visible:ring-2 focus-visible:ring-inset",
        className
      )}
      data-slot="stream-stats-bar"
      onContextMenu={(event) => {
        const stat =
          event.target instanceof Element
            ? event.target.closest<HTMLElement>("[data-stat]")
            : null;
        setMenuTarget((stat?.dataset.stat as StatId | undefined) ?? null);
      }}
      // A tab stop when it can be arranged, so its right-click menu opens
      // from the keyboard too (the context menu key, ⇧F10).
      // oxlint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- see above.
      tabIndex={onLayoutChange ? 0 : undefined}
    >
      <div className="flex min-w-0 items-center gap-4" data-slot="stats-main">
        {main.map((item) => (
          <StatCell drag={drag(item.id)} item={item} key={item.id} main />
        ))}
      </div>
      {more.length > 0 ? (
        // A fixed-height, clipped, wrapping row: a stat that doesn't fit
        // wraps out of sight whole. The zero-width lead lets even the first
        // stat wrap instead of showing half of itself.
        <div
          className="flex h-8 min-w-0 flex-1 flex-wrap content-start items-center overflow-hidden"
          data-slot="stats-more"
        >
          <span aria-hidden className="h-8 w-0" />
          {more.map((item, index) => (
            <span className="flex h-8 shrink-0 items-center" key={item.id}>
              {index === 0 ? (
                <span aria-hidden className="bg-border mx-3 h-4 w-px" />
              ) : (
                <span aria-hidden className="text-subtle mx-2">
                  ·
                </span>
              )}
              <StatCell drag={drag(item.id)} item={item} main={false} />
            </span>
          ))}
        </div>
      ) : null}
      {/* Hide screen's chip at the trailing edge: never clipped, and no stat
          moves when it comes or goes. */}
      {screenHidden ? (
        <span
          className="ml-auto flex shrink-0 items-center pl-3"
          data-slot="stats-screen-hidden"
        >
          <StatusBadge
            icon={HiddenIcon}
            tone="warn"
            value={SCREEN_HIDDEN_LABEL}
          />
        </span>
      ) : null}
    </section>
  );
  if (!onLayoutChange) {
    return bar;
  }
  return (
    <ContextMenu>
      <ContextMenuTrigger render={bar} />
      <StatsMenu
        layout={layout}
        onLayoutChange={onLayoutChange}
        placed={placed}
        shown={shown}
        target={menuTarget}
      />
    </ContextMenu>
  );
}

export {
  StreamStatsBar,
  DEFAULT_STAT_ORDER,
  DEFAULT_STATS_LAYOUT,
  LOCKED_STATS,
  MAIN_SLOTS,
  STAT_NAMES,
  arrangeStats,
  moveStat,
  setStatHidden,
  statsLayoutIsDefault,
  type SessionBadge,
  type StatDetailRow,
  type StatId,
  type StatItem,
  type StatTone,
  type StatsLayout,
  type StreamStatsBarProps,
};
