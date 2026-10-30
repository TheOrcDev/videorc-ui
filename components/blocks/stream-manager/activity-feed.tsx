"use client";

import { useState } from "react";
import type { ReactElement } from "react";

import { HighlightStatus } from "@/components/blocks/stream-manager/chat-message";
import type { ChatMessageHighlight } from "@/components/blocks/stream-manager/chat-message";
import { ChatPlatformIcon } from "@/components/blocks/stream-manager/chat-platform";
import type { ChatPlatform } from "@/components/blocks/stream-manager/chat-platform";
import {
  PlatformFilter,
  PlatformFilterMenuItems,
} from "@/components/blocks/stream-manager/platform-filter";
import type { PlatformFilterValue } from "@/components/blocks/stream-manager/platform-filter";
import {
  AnnouncementIcon,
  ChevronDownIcon,
  CopyIcon,
  FollowIcon,
  GiftIcon,
  LivestreamIcon,
  RaidIcon,
  SendIcon,
  SupporterIcon,
  TipIcon,
} from "@/components/icons";
import type { AppIcon } from "@/components/icons";
import { KebabMenu } from "@/components/kebab-menu";
import type { KebabMenuItem } from "@/components/kebab-menu";
import { StatusDot } from "@/components/status-dot";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CHROME_ROW_CLASS } from "@/components/ui/chrome-row";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Empty, EmptyDescription, EmptyHeader } from "@/components/ui/empty";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ShortcutTooltip } from "@/components/ui/shortcut-tooltip";
import { Switch } from "@/components/ui/switch";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

// The Stream Manager's Activity pane: structured events, never chat text.
// Follows, subs and gifts, tips, raids, watch streaks and announcements,
// and destinations that failed or came back. A row reads at a glance: who
// (their avatar, or initials), the short fact on one line, the time and the
// platform mark closing it, then the viewer's own words. The full sentence
// is on hover. One tint per row, like chat: a reward, a tip, a supporter;
// the row on stream wears the live plate instead, and hover paints over all.

/** Shown below 640 px of Stream Manager only. */
const NARROW_ONLY = "hidden @max-[639px]/stream-manager:flex";
/** Hidden below 640 px of Stream Manager. */
const ABOVE_NARROW = "@max-[639px]/stream-manager:hidden";

type ActivityKind =
  | "follow"
  | "subscription"
  | "membership"
  | "cheer"
  | "super-chat"
  | "super-sticker"
  | "power-up"
  | "redemption"
  | "raid"
  | "watch-streak"
  | "announcement"
  | "destination-failed"
  | "destination-recovered";

type ActivityFilter =
  | "follows"
  | "support"
  | "tips"
  | "rewards"
  | "raids"
  | "streaks"
  | "destinations";

/** The kind chips, in order, with what each one shows on hover. */
const ACTIVITY_FILTERS: readonly {
  id: ActivityFilter;
  label: string;
  title: string;
}[] = [
  { id: "follows", label: "Follows", title: "New followers" },
  { id: "support", label: "Subs", title: "Subs, gifts and memberships" },
  {
    id: "tips",
    label: "Tips",
    title: "Bits, Power-ups, Super Chats and Super Stickers",
  },
  { id: "rewards", label: "Rewards", title: "Channel point redemptions" },
  { id: "raids", label: "Raids", title: "Raids into your channel" },
  {
    id: "streaks",
    label: "Streaks",
    title: "Viewers who watched several streams in a row",
  },
  {
    id: "destinations",
    label: "Destinations",
    title: "A destination failed or came back",
  },
];

const KIND_FILTER: Readonly<Record<ActivityKind, ActivityFilter | null>> = {
  announcement: null,
  cheer: "tips",
  "destination-failed": "destinations",
  "destination-recovered": "destinations",
  follow: "follows",
  membership: "support",
  "power-up": "tips",
  raid: "raids",
  redemption: "rewards",
  subscription: "support",
  "super-chat": "tips",
  "super-sticker": "tips",
  "watch-streak": "streaks",
};

/** A kind's glyph, for a row about no one person. */
const KIND_ICONS: Readonly<Record<ActivityKind, AppIcon | null>> = {
  announcement: AnnouncementIcon,
  cheer: TipIcon,
  "destination-failed": null,
  "destination-recovered": null,
  follow: FollowIcon,
  membership: SupporterIcon,
  "power-up": TipIcon,
  raid: RaidIcon,
  redemption: null,
  subscription: SupporterIcon,
  "super-chat": TipIcon,
  "super-sticker": TipIcon,
  "watch-streak": null,
};

/** One event, as plain data. */
interface ActivityItem {
  id: string;
  kind: ActivityKind;
  platform: ChatPlatform;
  /** Who did it: the viewer, the raiding channel, or the destination. */
  name: string;
  /** The sentence: "Resubscribed for 8 months at Tier 1". On hover, and for Copy. */
  line: string;
  /** The fact at a glance: "Resub · 8 months". */
  short: string;
  /** The viewer's own words, when the event carried any. */
  message?: string;
  /** The time as the row shows it: "now", "2m", "1h". */
  time: string;
  /** When it happened, as an ISO string, for the `<time>` element. */
  at?: string;
  /** The chat message behind it: Show on stream puts this on stream. */
  messageId?: string;
  authorAvatarUrl?: string;
  /** A gifted sub or membership: the gift glyph. */
  gift?: boolean;
  /** Followers the platform counted but never named (X, or Twitch without the follow permission). */
  unnamed?: boolean;
  /** Its place on stream, when it has a chat message behind it. */
  highlight?: ChatMessageHighlight;
}

/** Which kind chip an event falls under; announcements fall under none. */
function activityFilterFor(kind: ActivityKind): ActivityFilter | null {
  return KIND_FILTER[kind];
}

/** The events one kind and one platform show. */
function filterActivity(
  items: readonly ActivityItem[],
  filter: ActivityFilter | "all",
  platform: PlatformFilterValue
): ActivityItem[] {
  return items.filter(
    (item) =>
      (filter === "all" || activityFilterFor(item.kind) === filter) &&
      (platform === "all" || item.platform === platform)
  );
}

/** Each kind chip's count. */
function activityFilterCounts(
  items: readonly ActivityItem[]
): Record<ActivityFilter, number> {
  const counts: Record<ActivityFilter, number> = {
    destinations: 0,
    follows: 0,
    raids: 0,
    rewards: 0,
    streaks: 0,
    support: 0,
    tips: 0,
  };
  for (const item of items) {
    const filter = activityFilterFor(item.kind);
    if (filter) {
      counts[filter] += 1;
    }
  }
  return counts;
}

/**
 * A row about one named viewer or channel shows who, not what. Unnamed
 * follower counts, announcements and destinations keep their glyph.
 */
function activityRowShowsPerson(item: ActivityItem): boolean {
  if (item.unnamed) {
    return false;
  }
  return (
    item.kind !== "announcement" &&
    item.kind !== "destination-failed" &&
    item.kind !== "destination-recovered"
  );
}

/** What Activity can never show for these platforms, said plainly. */
function activityCapabilityNote(
  platforms: readonly ChatPlatform[],
  {
    xNamesFollowers = false,
    twitchNeedsFollowNames = false,
  }: { xNamesFollowers?: boolean; twitchNeedsFollowNames?: boolean } = {}
): string | null {
  const notes: string[] = [];
  if (platforms.includes("x")) {
    notes.push(
      xNamesFollowers
        ? "X doesn't share tips."
        : "X doesn't share tips. New X followers show as a count."
    );
  }
  if (platforms.includes("twitch") && twitchNeedsFollowNames) {
    notes.push("Twitch names each follower once you allow it.");
  }
  if (
    platforms.some((platform) =>
      ["facebook", "tiktok", "instagram", "custom"].includes(platform)
    )
  ) {
    notes.push(
      "Facebook with a stream key, TikTok, Instagram and custom RTMP don't share comments or viewers."
    );
  }
  return notes.length > 0 ? notes.join(" ") : null;
}

/** The one label for every Twitch permission ask in the window. */
const TWITCH_RECONNECT_LABEL = "Reconnect Twitch";

type ActivityRowTint = "reward" | "paid" | "member";

/** A row's one tint, unless it's on stream, where the live plate wins. */
function activityRowTint(item: ActivityItem): ActivityRowTint | null {
  if (item.highlight?.phase === "live") {
    return null;
  }
  if (item.kind === "redemption") {
    return "reward";
  }
  const filter = activityFilterFor(item.kind);
  if (filter === "support") {
    return "member";
  }
  return filter === "tips" ? "paid" : null;
}

/** Flush rows split by hairlines: the paid tint is chat's fill without its ring. */
const TINT_CLASS: Readonly<Record<ActivityRowTint, string>> = {
  member: CHROME_ROW_CLASS.member,
  paid: "bg-warning/10",
  reward: "bg-reward/8",
};

const copyLine = (item: ActivityItem): void => {
  // Best effort: a page without clipboard access copies nothing.
  navigator.clipboard
    ?.writeText(
      [item.name, item.line, item.message].filter(Boolean).join(" · ")
    )
    .catch(() => null);
};

interface ActivityRowActions {
  onShowOnStream?: (item: ActivityItem) => void;
  onThank?: (item: ActivityItem) => void;
  onReconnectTwitch?: () => void;
}

/**
 * The row's ⋯ menu. Show on stream toggles, so on a live row it says what a
 * click does: Take off stream. Only removing a chat message says "remove".
 */
function activityRowActions(
  item: ActivityItem,
  { onShowOnStream, onThank, onReconnectTwitch }: ActivityRowActions
): KebabMenuItem[] {
  const phase = item.highlight?.phase ?? "idle";
  const destination = activityFilterFor(item.kind) === "destinations";
  const items: KebabMenuItem[] = [];
  if (onShowOnStream && item.messageId) {
    items.push({
      disabled: phase === "applying",
      icon: LivestreamIcon,
      id: "show",
      label: phase === "live" ? "Take off stream" : "Show on stream",
      onSelect: () => onShowOnStream(item),
    });
  }
  if (onThank && !destination && item.kind !== "announcement") {
    items.push({
      icon: SendIcon,
      id: "thank",
      label: "Thank in chat",
      onSelect: () => onThank(item),
    });
  }
  // A Twitch count without names: one click opens the reconnect that grants
  // the follow permission.
  if (onReconnectTwitch && item.unnamed && item.platform === "twitch") {
    items.push({
      icon: FollowIcon,
      id: "follow-names",
      label: TWITCH_RECONNECT_LABEL,
      onSelect: onReconnectTwitch,
    });
  }
  items.push({
    icon: CopyIcon,
    id: "copy",
    label: "Copy",
    onSelect: () => copyLine(item),
  });
  return items;
}

/** The sentence on hover, never a native `title`. Nothing to add, no tooltip. */
function SentenceHint({
  line,
  children,
}: {
  line: string | null;
  children: ReactElement;
}): ReactElement {
  if (!line) {
    return children;
  }
  return (
    <Tooltip>
      <TooltipTrigger render={children} />
      <TooltipContent>{line}</TooltipContent>
    </Tooltip>
  );
}

/** Initials for the avatar: the first letters of up to two words. */
function initials(name: string): string {
  const words = name.trim().split(/\s+/u).filter(Boolean);
  return (
    words
      .slice(0, 2)
      .map((word) => [...word][0]?.toUpperCase() ?? "")
      .join("") || "?"
  );
}

/** Who the row is about: their avatar or initials, or the event's glyph. */
function ActivityLead({ item }: { item: ActivityItem }): ReactElement {
  if (activityRowShowsPerson(item)) {
    return (
      <span
        aria-hidden
        className="border-border bg-muted/40 text-label text-muted-foreground relative mt-0.5 grid size-9 shrink-0 place-items-center overflow-hidden rounded-full border select-none"
        data-slot="activity-avatar"
      >
        {item.authorAvatarUrl ? (
          <img
            alt=""
            className="size-full object-cover"
            src={item.authorAvatarUrl}
          />
        ) : (
          initials(item.name)
        )}
      </span>
    );
  }
  const Icon = item.gift ? GiftIcon : KIND_ICONS[item.kind];
  return (
    <span
      className="rounded-chip bg-foreground/6 text-muted-foreground relative mt-0.5 flex size-9 shrink-0 items-center justify-center"
      data-slot="activity-glyph"
    >
      {Icon ? (
        <Icon aria-hidden className="size-4" weight="duotone" />
      ) : (
        <StatusDot
          tone={item.kind === "destination-failed" ? "error" : "good"}
        />
      )}
    </span>
  );
}

/**
 * Facts, not sentences: the name and the short fact on one line. The
 * sentence is the short fact's tooltip, or the name's when there is no fact,
 * and what a screen reader hears.
 */
function ActivityHeadline({ item }: { item: ActivityItem }): ReactElement {
  // The full sentence, when it says more than the short fact.
  const sentence = item.short && item.line !== item.short ? item.line : null;
  return (
    <>
      <SentenceHint line={item.short ? null : item.line}>
        <span className="text-foreground max-w-[60%] shrink-0 truncate text-sm font-medium">
          {item.name}
        </span>
      </SentenceHint>
      {item.short ? (
        <SentenceHint line={sentence}>
          <span
            aria-hidden={sentence ? true : undefined}
            className="text-muted-foreground min-w-0 truncate text-sm"
            data-slot="activity-line"
          >
            {item.short}
          </span>
        </SentenceHint>
      ) : null}
      {sentence || !item.short ? (
        <span className="sr-only">{item.line}</span>
      ) : null}
    </>
  );
}

function ActivityRow({
  item,
  timestamps,
  actions,
}: {
  item: ActivityItem;
  timestamps: "always" | "hover";
  actions: ActivityRowActions;
}): ReactElement {
  const highlight = item.highlight ?? { phase: "idle" };
  const status = highlight.phase !== "idle";
  const problem =
    highlight.phase === "failed" ? highlight.reason?.trim() || null : null;
  const tint = activityRowTint(item);
  return (
    <li
      className={cn(
        "group/activity group/kebab-host hover:bg-accent flex items-start gap-2.5 px-3 py-2",
        highlight.phase === "live" && CHROME_ROW_CLASS.live,
        tint && TINT_CLASS[tint]
      )}
      data-activity-id={item.id}
      data-highlight-phase={item.messageId ? highlight.phase : undefined}
      data-kind={item.kind}
      data-row-tint={tint ?? undefined}
      data-slot="activity-row"
    >
      <ActivityLead item={item} />
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="flex min-w-0 items-baseline gap-1.5">
          <ActivityHeadline item={item} />
          {status ? (
            <span className="ml-auto shrink-0 pl-1">
              <HighlightStatus highlight={highlight} />
            </span>
          ) : null}
          <time
            className={cn(
              "text-label text-muted-foreground shrink-0 pl-1 font-normal tabular-nums",
              !status && "ml-auto",
              timestamps === "hover" &&
                "opacity-0 group-focus-within/activity:opacity-100 group-hover/activity:opacity-100"
            )}
            dateTime={item.at}
          >
            {item.time}
          </time>
          {/* The platform mark closes the line on the far right. */}
          <ChatPlatformIcon
            className="mr-0 ml-1 self-center"
            decorative
            platform={item.platform}
          />
        </span>
        {item.message ? (
          <span className="text-foreground text-sm leading-snug wrap-break-word select-text">
            {item.message}
          </span>
        ) : null}
        {problem ? (
          // Why it didn't go on stream, while the badge says Failed.
          <span className="text-muted-foreground text-xs">{problem}</span>
        ) : null}
      </span>
      <KebabMenu
        className="-mr-1 shrink-0"
        items={activityRowActions(item, actions)}
        label={`Actions for ${item.name}`}
        reveal="hover"
      />
    </li>
  );
}

// Videorc's chips: the 28 px toggle with 12 px words. The Filters button
// below 640 px is the ghost button at the same height, tightened.
// oxlint-disable-next-line shadcn/no-restyle -- see above.
const WORD_CHIP_CLASS = "text-xs";
const FILTERS_BUTTON_CLASS =
  // oxlint-disable-next-line shadcn/no-restyle -- see above.
  "shrink-0 gap-1 px-2 text-xs";

interface ActivityFiltersProps {
  platforms: readonly ChatPlatform[];
  platform: PlatformFilterValue;
  onPlatformChange: (platform: PlatformFilterValue) => void;
  filter: ActivityFilter | "all";
  onFilterChange: (filter: ActivityFilter | "all") => void;
  counts: Record<ActivityFilter, number>;
}

/** The kind chips with their counts from 640 px, one Filters menu below it. */
function ActivityFilters({
  platforms,
  platform,
  onPlatformChange,
  filter,
  onFilterChange,
  counts,
}: ActivityFiltersProps): ReactElement {
  // A chip shows once it has rows, with its count.
  const shownFilters = ACTIVITY_FILTERS.filter(
    (option) => counts[option.id] > 0 || filter === option.id
  );
  const activeCount = Number(filter !== "all") + Number(platform !== "all");
  return (
    <>
      <div
        className={cn(
          "flex min-w-0 flex-wrap items-center gap-1",
          ABOVE_NARROW
        )}
      >
        <PlatformFilter
          label="Show activity from"
          onValueChange={onPlatformChange}
          platforms={platforms}
          value={platform}
        />
        {shownFilters.length > 0 ? (
          <ToggleGroup
            aria-label="Filter activity"
            className="flex-wrap justify-start"
            onValueChange={(next) =>
              onFilterChange((next[0] as ActivityFilter | undefined) ?? "all")
            }
            value={filter === "all" ? [] : [filter]}
          >
            {shownFilters.map((option) => (
              <ShortcutTooltip key={option.id} label={option.title}>
                <ToggleGroupItem className={WORD_CHIP_CLASS} value={option.id}>
                  {/* The space keeps the name "Raids 1", never "Raids1". */}
                  {option.label}{" "}
                  <span className="text-muted-foreground tabular-nums">
                    {counts[option.id]}
                  </span>
                </ToggleGroupItem>
              </ShortcutTooltip>
            ))}
          </ToggleGroup>
        ) : null}
      </div>
      {/* Below 640 px the same filters live in one menu, like chat's. */}
      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label="Activity filters"
          render={
            <Button
              className={cn(FILTERS_BUTTON_CLASS, NARROW_ONLY)}
              type="button"
              variant="ghost"
            />
          }
        >
          Filters
          {activeCount > 0 ? (
            <Badge variant="outline">{activeCount}</Badge>
          ) : null}
          <ChevronDownIcon data-icon="inline-end" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-52">
          <DropdownMenuRadioGroup
            onValueChange={(next) =>
              onFilterChange(next as ActivityFilter | "all")
            }
            value={filter}
          >
            <DropdownMenuLabel>Show</DropdownMenuLabel>
            <DropdownMenuRadioItem value="all">
              Everything
            </DropdownMenuRadioItem>
            {shownFilters.map((option) => (
              <DropdownMenuRadioItem key={option.id} value={option.id}>
                {option.label}
                <span className="text-muted-foreground ml-auto tabular-nums">
                  {counts[option.id]}
                </span>
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
          {platforms.length > 1 ? (
            <>
              <DropdownMenuSeparator />
              <PlatformFilterMenuItems
                label="Show activity from"
                onValueChange={onPlatformChange}
                platforms={platforms}
                value={platform}
              />
            </>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}

// The label is the Switch's own row in the filter strip, not a tooltip
// trigger's look: the trigger only renders it.
const AUTO_SHOW_LABEL_CLASS =
  // oxlint-disable-next-line shadcn/no-restyle -- see above.
  "text-muted-foreground ml-auto flex h-6 shrink-0 items-center gap-1.5 text-xs select-none";

/** Auto-show: new events pop onto the stream by themselves. Manual picks always win. */
function AutoShowSwitch({
  checked,
  onCheckedChange,
}: {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}): ReactElement {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          // oxlint-disable-next-line jsx-a11y/label-has-associated-control -- The Switch inside it is the control, named by its own aria-label.
          <label className={AUTO_SHOW_LABEL_CLASS} />
        }
      >
        Auto-show
        <Switch
          aria-label="Automatically show new follows, subs, gifts, tips, rewards, raids and streaks on stream"
          checked={checked}
          onCheckedChange={onCheckedChange}
          size="sm"
        />
      </TooltipTrigger>
      <TooltipContent>
        Shows new follows, subs, gifts, tips, rewards, raids and streaks on
        stream for a few seconds
      </TooltipContent>
    </Tooltip>
  );
}

const NO_ITEMS: readonly ActivityItem[] = [];

interface ActivityFeedProps {
  items?: readonly ActivityItem[];
  /** The platforms on this stream: the platform chips. */
  platforms: readonly ChatPlatform[];
  /** What Activity can't show here, under the empty line (see `activityCapabilityNote`). */
  note?: string | null;
  /** `hover` keeps a row's time out of sight until the pointer is on it (while live). */
  timestamps?: "always" | "hover";
  onShowOnStream?: (item: ActivityItem) => void;
  /** Thank in chat: the window prefills the composer. */
  onThank?: (item: ActivityItem) => void;
  /** Twitch still needs a permission to name followers, or for Power-ups and channel points. */
  twitchNeeds?: { followNames?: boolean; bitsAndPoints?: boolean };
  /** Reconnects Twitch with the permissions it's missing. */
  onReconnectTwitch?: () => void;
  /** Auto-show celebrations on stream. The switch shows with `onAutoShowChange`. */
  autoShow?: boolean;
  onAutoShowChange?: (on: boolean) => void;
  className?: string;
}

function ActivityFeed({
  items = NO_ITEMS,
  platforms,
  note = null,
  timestamps = "always",
  onShowOnStream,
  onThank,
  twitchNeeds,
  onReconnectTwitch,
  autoShow = false,
  onAutoShowChange,
  className,
}: ActivityFeedProps): ReactElement {
  const [filter, setFilter] = useState<ActivityFilter | "all">("all");
  const [platform, setPlatform] = useState<PlatformFilterValue>("all");
  const shown = filterActivity(items, filter, platform);
  // Counts follow the platform pick: a chip says what a click would show.
  const counts = activityFilterCounts(filterActivity(items, "all", platform));
  const actions = { onReconnectTwitch, onShowOnStream, onThank };
  return (
    <section
      aria-label="Activity"
      className={cn("flex min-h-0 flex-1 flex-col", className)}
      data-slot="activity-feed"
    >
      <div className="border-border flex shrink-0 items-center gap-2 border-b px-2 py-1.5">
        <ActivityFilters
          counts={counts}
          filter={filter}
          onFilterChange={setFilter}
          onPlatformChange={setPlatform}
          platform={platform}
          platforms={platforms}
        />
        {onAutoShowChange ? (
          <AutoShowSwitch
            checked={autoShow}
            onCheckedChange={onAutoShowChange}
          />
        ) : null}
      </div>
      {/* Power-ups and redemptions arrive with no row to carry the ask, so
          it stays in view until Twitch allows them. */}
      {onReconnectTwitch && twitchNeeds?.bitsAndPoints ? (
        <div className="border-border flex shrink-0 items-center justify-between gap-2 border-b px-3 py-1.5">
          <span className="text-muted-foreground text-xs">
            Power-ups and channel points need one more Twitch permission.
          </span>
          <Button
            className="shrink-0"
            onClick={onReconnectTwitch}
            size="xs"
            variant="outline"
          >
            {TWITCH_RECONNECT_LABEL}
          </Button>
        </div>
      ) : null}
      <ScrollArea className="min-h-0 flex-1">
        {shown.length > 0 ? (
          <ol
            aria-label="Activity"
            className="divide-border flex flex-col divide-y"
          >
            {shown.map((item) => (
              <ActivityRow
                actions={actions}
                item={item}
                key={item.id}
                timestamps={timestamps}
              />
            ))}
          </ol>
        ) : (
          <Empty>
            <EmptyHeader>
              <EmptyDescription>
                {items.length > 0
                  ? "Nothing matches this filter."
                  : "Follows, subs, gifts, tips and raids appear here as they happen."}
                {note ? <span className="mt-1 block">{note}</span> : null}
              </EmptyDescription>
              {onReconnectTwitch && twitchNeeds?.followNames ? (
                <Button
                  className="mt-2"
                  onClick={onReconnectTwitch}
                  variant="outline"
                >
                  {TWITCH_RECONNECT_LABEL}
                </Button>
              ) : null}
            </EmptyHeader>
          </Empty>
        )}
      </ScrollArea>
    </section>
  );
}

export {
  ActivityFeed,
  ACTIVITY_FILTERS,
  TWITCH_RECONNECT_LABEL,
  activityCapabilityNote,
  activityFilterCounts,
  activityFilterFor,
  activityRowActions,
  activityRowShowsPerson,
  activityRowTint,
  filterActivity,
  type ActivityFeedProps,
  type ActivityFilter,
  type ActivityItem,
  type ActivityKind,
  type ActivityRowTint,
};
