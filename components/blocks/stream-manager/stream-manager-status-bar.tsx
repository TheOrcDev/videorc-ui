"use client";

import { useState } from "react";
import type { ReactElement } from "react";

import {
  CHAT_PLATFORM_LABELS,
  ChatPlatformIcon,
  chatStateLabel,
} from "@/components/blocks/stream-manager/chat-platform";
import type {
  ChatDestination,
  ChatPlatform,
} from "@/components/blocks/stream-manager/chat-platform";
import {
  DEFAULT_STATS_LAYOUT,
  DEFAULT_STAT_ORDER,
  LOCKED_STATS,
  STAT_NAMES,
  setStatHidden,
  statsLayoutIsDefault,
} from "@/components/blocks/stream-manager/stream-stats-bar";
import type { StatsLayout } from "@/components/blocks/stream-manager/stream-stats-bar";
import { ConfirmDialog } from "@/components/confirm-dialog";
import {
  ClipIcon,
  FrameIcon,
  HiddenIcon,
  MoreIcon,
  PreviewIcon,
} from "@/components/icons";
import {
  PIN_WINDOW_LABEL,
  PinWindowButton,
} from "@/components/pin-window-button";
import { StatusBar, StatusBarHint } from "@/components/status-bar";
import { StatusBarAction } from "@/components/status-bar-action";
import { StatusDot } from "@/components/status-dot";
import type { StatusDotTone } from "@/components/status-dot";
import { Button } from "@/components/ui/button";
import { DisabledReason } from "@/components/ui/disabled-reason";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { ShortcutKeys } from "@/components/ui/shortcut-keys";
import { ShortcutTooltip } from "@/components/ui/shortcut-tooltip";
import { cn } from "@/lib/utils";

// The Stream Manager's status bar: each destination's chat state on the
// left, the window's quiet controls on the right. The title row keeps the
// title only. Quiet when fine: a platform that reads and sends is its mark
// and a green dot, and a word appears only when something needs the
// streamer ("read-only", "reconnect to send"). Below 800 px the hints keep
// their keys alone; below 640 px every control folds into one ⋯ menu, so
// none is ever clipped.

/** Shown below 640 px of Stream Manager only. */
const NARROW_ONLY = "hidden @max-[639px]/stream-manager:flex";
/** Hidden below 640 px of Stream Manager. */
const ABOVE_NARROW = "@max-[639px]/stream-manager:hidden";
/** A word that leaves the eye (not the screen reader) below 800 px. */
const COMPACT_LABEL = "@max-[799px]/stream-manager:sr-only";
/** A word shown at Wide only: below 1,040 px the icon and its tooltip carry it. */
const WIDE_LABEL = "@max-[1039px]/stream-manager:sr-only";

/** Where a message on stream sits over the video. */
type HighlightPosition =
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right";

const HIGHLIGHT_POSITION_LABELS: Readonly<Record<HighlightPosition, string>> = {
  "bottom-left": "Bottom left",
  "bottom-right": "Bottom right",
  "top-left": "Top left",
  "top-right": "Top right",
};

const HIGHLIGHT_POSITIONS = Object.keys(
  HIGHLIGHT_POSITION_LABELS
) as HighlightPosition[];

/** A banner Studio can show over the stream. */
interface StreamBanner {
  id: string;
  name: string;
  shown: boolean;
}

type BannerAction =
  | { action: "show" | "hide"; id: string }
  | { action: "hideAll" };

/** The two clip lengths, in seconds. */
type ClipLength = 30 | 60;

/** The window's keys, as Electron accelerators. */
const SHORTCUTS = {
  buddy: "CmdOrCtrl+J",
  search: "CmdOrCtrl+F",
  write: "CmdOrCtrl+L",
} as const;

function destinationTone(destination: ChatDestination): StatusDotTone {
  switch (destination.state) {
    case "connected": {
      return "good";
    }
    case "connecting":
    case "reconnecting":
    case "waiting":
    case "paused": {
      return "warn";
    }
    case "failed": {
      return "error";
    }
    default: {
      return "neutral";
    }
  }
}

/**
 * What chat can't do on this platform right now, in a word or two:
 * "read-only", "reconnect to send", "failed". Empty when it reads and
 * sends, so a healthy platform is just its mark and its dot.
 */
function destinationCapabilityLabel(destination: ChatDestination): string {
  const label = chatStateLabel(destination);
  return label === "Connected" ? "" : label.toLowerCase();
}

/** The destination's own words when chat is stuck or has stopped. */
function destinationProblem(destination: ChatDestination): string {
  const stuck =
    destination.state === "waiting" ||
    destination.state === "paused" ||
    destination.state === "failed";
  return stuck ? (destination.message ?? "") : "";
}

/** The hover card: what chat can do, the destination's own words, the account, then any notes. */
function destinationLines(
  destination: ChatDestination,
  notes: readonly string[] = []
): string[] {
  const capability =
    destinationCapabilityLabel(destination) || "reads and sends";
  return [
    `${CHAT_PLATFORM_LABELS[destination.platform]} chat: ${capability}`,
    destination.message ?? "",
    destination.accountLabel
      ? `Reading chat as ${destination.accountLabel}.`
      : "",
    ...notes,
  ].filter(Boolean);
}

// The chat state is a plain button the hover card's trigger renders: the
// status bar's own hover block and focus ring, not a card trigger's look.
const CHAT_STATE_CLASS =
  // oxlint-disable-next-line shadcn/no-restyle -- see above.
  "rounded-chip hover:bg-accent focus-visible:ring-ring/50 -mx-1 flex min-w-0 shrink items-center gap-1.5 px-1 outline-none focus-visible:ring-2";

/** One destination's chat state: its mark, its dot, and a word only when needed. */
function ChatState({
  destination,
  notes,
}: {
  destination: ChatDestination;
  notes?: readonly string[];
}): ReactElement {
  const label = destinationCapabilityLabel(destination);
  const problem = destinationProblem(destination);
  const tone = destinationTone(destination);
  const lines = destinationLines(destination, notes);
  let word: ReactElement | null = null;
  if (problem) {
    word = (
      <span className={cn("max-w-lg truncate", ABOVE_NARROW)}>{problem}</span>
    );
  } else if (label) {
    word = (
      <span className={cn("truncate", ABOVE_NARROW, COMPACT_LABEL)}>
        {CHAT_PLATFORM_LABELS[destination.platform]} {label}
      </span>
    );
  }
  // The details open on hover and on focus; below 640 px a dot that isn't
  // green keeps a word beside it.
  return (
    <HoverCard>
      <HoverCardTrigger
        closeDelay={80}
        delay={400}
        render={
          <button
            aria-label={lines[0]}
            className={CHAT_STATE_CLASS}
            data-slot="chat-state"
            type="button"
          />
        }
      >
        <ChatPlatformIcon decorative platform={destination.platform} />
        <StatusDot tone={tone} />
        {word}
        {tone !== "good" && label ? (
          <span className={cn("truncate", NARROW_ONLY)}>{label}</span>
        ) : null}
      </HoverCardTrigger>
      <HoverCardContent align="start" className={DETAILS_CLASS} side="top">
        <div className="flex flex-col gap-1 text-xs">
          {lines.map((line, index) => (
            <p
              className={
                index === 0
                  ? "text-foreground font-medium"
                  : "text-muted-foreground"
              }
              key={line}
            >
              {line}
            </p>
          ))}
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}

// A hover card of lines, at the menu's 8 px inset rather than the card's 12.
// oxlint-disable-next-line shadcn/no-restyle -- see above.
const DETAILS_CLASS = "w-64 p-2";

/** The Highlight position choices: the status bar's menu and the ⋯ fold share them. */
function HighlightPositionItems({
  position,
  onChange,
}: {
  position: HighlightPosition;
  onChange: (position: HighlightPosition) => void;
}): ReactElement {
  return (
    <DropdownMenuRadioGroup
      onValueChange={(value) => onChange(value as HighlightPosition)}
      value={position}
    >
      <DropdownMenuLabel>Show highlighted messages in</DropdownMenuLabel>
      {HIGHLIGHT_POSITIONS.map((option) => (
        <DropdownMenuRadioItem key={option} value={option}>
          {HIGHLIGHT_POSITION_LABELS[option]}
        </DropdownMenuRadioItem>
      ))}
    </DropdownMenuRadioGroup>
  );
}

/**
 * The Banners menu: one check per banner, checked while it shows, then Hide
 * all banners. The check moves when the list comes back, so the menu stays
 * open for the next one.
 */
function BannerItems({
  banners,
  onBanner,
}: {
  banners: readonly StreamBanner[] | null;
  onBanner: (action: BannerAction) => void;
}): ReactElement {
  if (!banners?.length) {
    return (
      <DropdownMenuItem disabled>
        {banners ? "Import banners in Assets" : "Loading banners…"}
      </DropdownMenuItem>
    );
  }
  return (
    <>
      <DropdownMenuGroup>
        {banners.map((banner) => (
          <DropdownMenuCheckboxItem
            checked={banner.shown}
            closeOnClick={false}
            key={banner.id}
            onCheckedChange={(checked) =>
              onBanner({ action: checked ? "show" : "hide", id: banner.id })
            }
          >
            <span className="truncate">{banner.name}</span>
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuGroup>
      <DropdownMenuSeparator />
      <DropdownMenuItem
        disabled={!banners.some((banner) => banner.shown)}
        onClick={() => onBanner({ action: "hideAll" })}
      >
        Hide all banners
      </DropdownMenuItem>
    </>
  );
}

/** The ⋯ fold's Show or hide stats: the stats bar's right-click choices. */
function StatsItems({
  layout,
  onChange,
}: {
  layout: StatsLayout;
  onChange: (layout: StatsLayout) => void;
}): ReactElement {
  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger>Show or hide stats</DropdownMenuSubTrigger>
      <DropdownMenuSubContent>
        {DEFAULT_STAT_ORDER.filter((id) => !LOCKED_STATS.has(id)).map((id) => (
          <DropdownMenuCheckboxItem
            checked={!layout.hidden.includes(id)}
            closeOnClick={false}
            key={id}
            onCheckedChange={(checked) =>
              onChange(setStatHidden(layout, id, !checked))
            }
          >
            {STAT_NAMES[id]}
          </DropdownMenuCheckboxItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          disabled={statsLayoutIsDefault(layout)}
          onClick={() => onChange(DEFAULT_STATS_LAYOUT)}
        >
          Reset stats
        </DropdownMenuItem>
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  );
}

interface Hint {
  id: keyof typeof SHORTCUTS;
  label: string;
  menuLabel: string;
  run: () => void;
}

interface ClipButton {
  seconds: ClipLength;
  text: string;
  menuText: string;
  label: string;
  hint: string;
}

/** The two Clip buttons: the last 30 seconds, then the last minute. */
const CLIP_BUTTONS: readonly ClipButton[] = [
  {
    hint: "Save the last 30 seconds as a clip, or say “clip that”",
    label: "Save a 30-second clip",
    menuText: "Clip 30 s",
    seconds: 30,
    text: "Clip 30 s",
  },
  {
    hint: "Save the last minute as a clip, or say “clip the last minute”",
    label: "Save a 1-minute clip",
    menuText: "Clip 1 min",
    seconds: 60,
    text: "1 min",
  },
];

interface ScreenPrivacyAction {
  label: string;
  hint: string;
  disabledReason: string | null;
  run: () => void;
}

interface StreamManagerStatusBarProps {
  /** Each destination's chat state, on the left. */
  destinations: readonly ChatDestination[];
  /** More lines for a platform's hover card: what its audience numbers can't say. */
  destinationNotes?: Partial<Record<ChatPlatform, readonly string[]>>;
  /** ⌘F Search: focuses chat's search. */
  onSearchChat?: () => void;
  /** ⌘L Write: focuses the composer. */
  onWriteInChat?: () => void;
  /** ⌘J Buddy: brings Buddy's pane forward. */
  onFocusBuddy?: () => void;
  /** Keep on top. The pin shows with `onPinnedChange`. */
  pinned?: boolean;
  onPinnedChange?: (pinned: boolean) => void;
  highlightPosition?: HighlightPosition;
  onHighlightPositionChange?: (position: HighlightPosition) => void;
  /** The Clip buttons: on air, or whenever the ring holds frames. */
  onMarkClip?: (seconds: ClipLength) => void;
  /** Hide screen's state. The action shows with `onScreenPrivacy`. */
  screenHidden?: boolean;
  /** Hides (true) or shows (false) the screen to viewers. */
  onScreenPrivacy?: (hidden: boolean) => void;
  /** Why a hide can't run now. Showing again always runs. */
  screenHideDisabledReason?: string | null;
  /** The banners Studio can show; null until the list loads. */
  banners?: readonly StreamBanner[] | null;
  onBanner?: (action: BannerAction) => void;
  /** Clear view. It asks first: it can't be undone. */
  onClear?: () => void;
  onOpenPreview?: () => void;
  /** The stats bar's layout, for the ⋯ fold's Show or hide stats. */
  statsLayout?: StatsLayout;
  onStatsLayoutChange?: (layout: StatsLayout) => void;
  /** `darwin`, `win32`, `linux`…: how the keys are printed. */
  platform?: string;
  className?: string;
}

function screenPrivacyAction({
  screenHidden = false,
  onScreenPrivacy,
  screenHideDisabledReason = null,
}: StreamManagerStatusBarProps): ScreenPrivacyAction | null {
  if (!onScreenPrivacy) {
    return null;
  }
  return {
    // Only a hide is ever refused: a hidden screen is never stuck.
    disabledReason: screenHidden ? null : screenHideDisabledReason,
    hint: screenHidden
      ? "Show your screen to viewers again"
      : "Cover your screen with a frosted picture on the recording and every stream",
    label: screenHidden ? "Show screen" : "Hide screen",
    run: () => onScreenPrivacy(!screenHidden),
  };
}

function windowHints({
  onSearchChat,
  onWriteInChat,
  onFocusBuddy,
}: StreamManagerStatusBarProps): Hint[] {
  const hints: Hint[] = [];
  if (onSearchChat) {
    hints.push({
      id: "search",
      label: "Search",
      menuLabel: "Search chat",
      run: onSearchChat,
    });
  }
  if (onWriteInChat) {
    hints.push({
      id: "write",
      label: "Write",
      menuLabel: "Write in chat",
      run: onWriteInChat,
    });
  }
  if (onFocusBuddy) {
    hints.push({
      id: "buddy",
      label: "Buddy",
      menuLabel: "Focus Buddy",
      run: onFocusBuddy,
    });
  }
  return hints;
}

/** Every control, labelled, from 640 px. */
function WideActions({
  props,
  hints,
  privacy,
  onRequestClear,
}: {
  props: StreamManagerStatusBarProps;
  hints: readonly Hint[];
  privacy: ScreenPrivacyAction | null;
  onRequestClear?: () => void;
}): ReactElement {
  const {
    platform,
    pinned = false,
    onPinnedChange,
    highlightPosition,
    onHighlightPositionChange,
    onMarkClip,
    banners = null,
    onBanner,
    onOpenPreview,
  } = props;
  return (
    <div
      className={cn(
        "flex items-center gap-0.5 [-webkit-app-region:no-drag]",
        ABOVE_NARROW
      )}
      data-slot="stream-manager-actions"
    >
      {hints.map((hint) => (
        <StatusBarHint
          accelerator={SHORTCUTS[hint.id]}
          key={hint.id}
          label={hint.label}
          labelClassName={COMPACT_LABEL}
          onClick={() => hint.run()}
          platform={platform}
        />
      ))}
      {/* Icon and word at Wide; below it the icon, the tooltip and the
          stats bar's Screen hidden chip carry it. */}
      {privacy ? (
        <DisabledReason reason={privacy.disabledReason} side="top">
          <StatusBarAction
            disabled={privacy.disabledReason !== null}
            hint={privacy.disabledReason ? undefined : privacy.hint}
            icon={<HiddenIcon aria-hidden />}
            label={privacy.label}
            onClick={() => privacy.run()}
            text={<span className={WIDE_LABEL}>{privacy.label}</span>}
          />
        </DisabledReason>
      ) : null}
      {onPinnedChange ? (
        <PinWindowButton
          onPinnedChange={onPinnedChange}
          pinned={pinned}
          variant="status-bar"
        />
      ) : null}
      {highlightPosition && onHighlightPositionChange ? (
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <StatusBarAction
                hint={`Highlight position: ${HIGHLIGHT_POSITION_LABELS[highlightPosition]}`}
                icon={<FrameIcon aria-hidden />}
                label="Highlight position"
              />
            }
          />
          <DropdownMenuContent align="end" side="top">
            <HighlightPositionItems
              onChange={onHighlightPositionChange}
              position={highlightPosition}
            />
          </DropdownMenuContent>
        </DropdownMenu>
      ) : null}
      {onMarkClip
        ? CLIP_BUTTONS.map((button, index) => (
            <StatusBarAction
              hint={button.hint}
              icon={index === 0 ? <ClipIcon aria-hidden /> : undefined}
              key={button.seconds}
              label={button.label}
              onClick={() => onMarkClip(button.seconds)}
              text={button.text}
            />
          ))
        : null}
      {onBanner ? (
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <StatusBarAction
                hint="Show or hide your banners"
                label="Banners"
                text="Banners"
              />
            }
          />
          <DropdownMenuContent align="end" className="w-56" side="top">
            <BannerItems banners={banners} onBanner={onBanner} />
          </DropdownMenuContent>
        </DropdownMenu>
      ) : null}
      {onRequestClear ? (
        <StatusBarAction
          hint="Clear view (keeps Library history)"
          label="Clear view"
          onClick={onRequestClear}
          text="Clear"
        />
      ) : null}
      {onOpenPreview ? (
        <StatusBarAction
          icon={<PreviewIcon aria-hidden />}
          label="Open Preview"
          onClick={onOpenPreview}
        />
      ) : null}
    </div>
  );
}

/** Below 640 px every control folds into one ⋯ menu. */
function MoreActionsMenu({
  props,
  hints,
  privacy,
  onRequestClear,
}: {
  props: StreamManagerStatusBarProps;
  hints: readonly Hint[];
  privacy: ScreenPrivacyAction | null;
  onRequestClear?: () => void;
}): ReactElement {
  const {
    platform,
    pinned = false,
    onPinnedChange,
    highlightPosition,
    onHighlightPositionChange,
    onMarkClip,
    banners = null,
    onBanner,
    onOpenPreview,
    statsLayout,
    onStatsLayoutChange,
  } = props;
  return (
    <DropdownMenu>
      <ShortcutTooltip label="More Stream Manager actions">
        <DropdownMenuTrigger
          aria-label="More Stream Manager actions"
          render={
            <Button
              className={NARROW_ONLY}
              size="icon-xs"
              type="button"
              variant="ghost"
            />
          }
        >
          <MoreIcon data-icon="inline-start" weight="bold" />
        </DropdownMenuTrigger>
      </ShortcutTooltip>
      <DropdownMenuContent align="end" className="w-56" side="top">
        {hints.length > 0 ? (
          <>
            <DropdownMenuGroup>
              {hints.map((hint) => (
                <DropdownMenuItem key={hint.id} onClick={() => hint.run()}>
                  {hint.menuLabel}
                  <DropdownMenuShortcut>
                    <ShortcutKeys
                      accelerator={SHORTCUTS[hint.id]}
                      platform={platform}
                      variant="text"
                    />
                  </DropdownMenuShortcut>
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
          </>
        ) : null}
        <DropdownMenuGroup>
          {privacy ? (
            <DisabledReason
              focusable={false}
              reason={privacy.disabledReason}
              side="left"
            >
              <DropdownMenuItem
                disabled={privacy.disabledReason !== null}
                onClick={() => privacy.run()}
              >
                <HiddenIcon />
                {privacy.label}
              </DropdownMenuItem>
            </DisabledReason>
          ) : null}
          {highlightPosition && onHighlightPositionChange ? (
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <FrameIcon />
                Highlight position
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <HighlightPositionItems
                  onChange={onHighlightPositionChange}
                  position={highlightPosition}
                />
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          ) : null}
          {onPinnedChange ? (
            <DropdownMenuCheckboxItem
              checked={pinned}
              onCheckedChange={() => onPinnedChange(!pinned)}
            >
              {PIN_WINDOW_LABEL}
            </DropdownMenuCheckboxItem>
          ) : null}
          {onMarkClip
            ? CLIP_BUTTONS.map((button) => (
                <DropdownMenuItem
                  key={button.seconds}
                  onClick={() => onMarkClip(button.seconds)}
                >
                  <ClipIcon />
                  {button.menuText}
                </DropdownMenuItem>
              ))
            : null}
          {onBanner ? (
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>Banners</DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="w-56">
                <BannerItems banners={banners} onBanner={onBanner} />
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          ) : null}
          {onOpenPreview ? (
            <DropdownMenuItem onClick={onOpenPreview}>
              <PreviewIcon />
              Open Preview
            </DropdownMenuItem>
          ) : null}
          {statsLayout && onStatsLayoutChange ? (
            <StatsItems layout={statsLayout} onChange={onStatsLayoutChange} />
          ) : null}
        </DropdownMenuGroup>
        {onRequestClear ? (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onRequestClear}>
              <span className="flex flex-col">
                <span>Clear view</span>
                <span className="text-label text-muted-foreground font-normal">
                  Keeps Library history.
                </span>
              </span>
            </DropdownMenuItem>
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/**
 * The window's status bar: 32 px, not the shared 26, because the platform
 * marks are 20 px (YouTube's minimum) and need room inside the border.
 */
function StreamManagerStatusBar(
  props: StreamManagerStatusBarProps
): ReactElement {
  const { destinations, destinationNotes, onClear, className } = props;
  // Clear empties chat and Activity for this window and can't be undone, so
  // both its homes (the button, the ⋯ menu) ask first.
  const [confirmingClear, setConfirmingClear] = useState(false);
  const requestClear = onClear ? () => setConfirmingClear(true) : undefined;
  const privacy = screenPrivacyAction(props);
  const hints = windowHints(props);
  return (
    <>
      <StatusBar
        className={cn("h-8 gap-2", className)}
        leading={
          // The clip keeps chat states that can't shrink off the controls.
          // The padding (cancelled by the negative margin) is the status
          // dot's halo and glow, which paint outside its box.
          <span
            className="-my-1 -mr-2 flex min-w-0 items-center gap-3 overflow-hidden py-1 pr-2"
            data-slot="chat-states"
          >
            {destinations.map((destination) => (
              <ChatState
                destination={destination}
                key={destination.id}
                notes={destinationNotes?.[destination.platform]}
              />
            ))}
          </span>
        }
      >
        <div
          className="flex min-w-0 items-center"
          data-slot="stream-manager-controls"
        >
          <WideActions
            hints={hints}
            onRequestClear={requestClear}
            privacy={privacy}
            props={props}
          />
          <MoreActionsMenu
            hints={hints}
            onRequestClear={requestClear}
            privacy={privacy}
            props={props}
          />
        </div>
      </StatusBar>
      <ConfirmDialog
        confirmLabel="Clear view"
        description="Chat and Activity in this window are emptied and the messages per minute start over. The Library keeps the history."
        onCancel={() => setConfirmingClear(false)}
        onConfirm={() => {
          setConfirmingClear(false);
          onClear?.();
        }}
        open={confirmingClear}
        title="Clear the view?"
      />
    </>
  );
}

export {
  StreamManagerStatusBar,
  HIGHLIGHT_POSITION_LABELS,
  destinationCapabilityLabel,
  type BannerAction,
  type ClipLength,
  type HighlightPosition,
  type StreamBanner,
  type StreamManagerStatusBarProps,
};
