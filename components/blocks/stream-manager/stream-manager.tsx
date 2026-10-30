"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { KeyboardEvent, ReactElement, ReactNode, RefObject } from "react";

import { ActivityFeed } from "@/components/blocks/stream-manager/activity-feed";
import type {
  ActivityFeedProps,
  ActivityItem,
} from "@/components/blocks/stream-manager/activity-feed";
import { ChatComposer } from "@/components/blocks/stream-manager/chat-composer";
import type {
  ChatComposerCommand,
  ChatSendFailure,
  ChatSendOptions,
} from "@/components/blocks/stream-manager/chat-composer";
import { ChatMessage } from "@/components/blocks/stream-manager/chat-message";
import type {
  ChatMessageData,
  ChatMessageFlag,
  ChatMessageHighlight,
  ChatMessageHighlightPhase,
  ChatMessageRemoval,
} from "@/components/blocks/stream-manager/chat-message";
import type {
  ChatDestination,
  ChatPlatform,
} from "@/components/blocks/stream-manager/chat-platform";
import {
  ChatToolbar,
  DEFAULT_CHAT_FILTER,
  chatFilterActive,
  filterChatMessages,
} from "@/components/blocks/stream-manager/chat-toolbar";
import type { ChatFilter } from "@/components/blocks/stream-manager/chat-toolbar";
import { StreamManagerStatusBar } from "@/components/blocks/stream-manager/stream-manager-status-bar";
import type { StreamManagerStatusBarProps } from "@/components/blocks/stream-manager/stream-manager-status-bar";
import { StreamStatsBar } from "@/components/blocks/stream-manager/stream-stats-bar";
import type {
  StatItem,
  StatsLayout,
} from "@/components/blocks/stream-manager/stream-stats-bar";
import { StatusDot } from "@/components/status-dot";
import type { StatusDotTone } from "@/components/status-dot";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Empty, EmptyDescription, EmptyHeader } from "@/components/ui/empty";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WindowFrame, WindowHeader } from "@/components/window-frame";
import { cn } from "@/lib/utils";

// The Stream Manager: Videorc's live dashboard window, composed from its
// parts. One window, three widths, and every pane renders exactly once;
// only its placement changes. The body is a CSS container
// (`@container/stream-manager`), so the layout follows the window's own
// width, never the viewport:
//   Wide    1,040 px and up: the stats bar, then Chat beside a right pane
//           with Activity and Buddy tabs.
//   Medium  640 to 1,039 px: the stats bar, then one pane behind Chat,
//           Activity and Buddy tabs.
//   Narrow  under 640 px (320 minimum): the same, with the filters and the
//           status bar's controls folded into menus.
// Class strings stay literal so Tailwind's scanner generates them.

/** Shown at Wide only. */
const WIDE_ONLY = "hidden @min-[1040px]/stream-manager:flex";
/** Hidden at Wide. */
const BELOW_WIDE = "@min-[1040px]/stream-manager:hidden";
/** The body grid: one column below Wide, Chat beside a right pane at Wide. */
const PANES_GRID =
  "grid min-h-0 flex-1 grid-cols-1 grid-rows-[auto_minmax(0,1fr)] @min-[1040px]/stream-manager:grid-cols-[minmax(0,1fr)_clamp(340px,34%,440px)]";

type StreamManagerPane = "chat" | "activity" | "buddy";
type StreamManagerRightPane = Exclude<StreamManagerPane, "chat">;

/**
 * A pane's placement. Below Wide the tabs pick one of the three panes; at
 * Wide Chat always shows and the right pane shows the one picked there.
 */
function paneClasses(
  pane: StreamManagerPane,
  narrowPane: StreamManagerPane,
  rightPane: StreamManagerRightPane
): string {
  const belowWide = narrowPane === pane ? "flex" : "hidden";
  if (pane === "chat") {
    return `${belowWide} row-start-2 @min-[1040px]/stream-manager:col-start-1 @min-[1040px]/stream-manager:row-span-2 @min-[1040px]/stream-manager:row-start-1 @min-[1040px]/stream-manager:flex`;
  }
  const wide =
    rightPane === pane
      ? "@min-[1040px]/stream-manager:flex"
      : "@min-[1040px]/stream-manager:hidden";
  return `${belowWide} ${wide} row-start-2 @min-[1040px]/stream-manager:col-start-2 @min-[1040px]/stream-manager:border-l @min-[1040px]/stream-manager:border-border`;
}

/** The message on stream now: Chat and Activity read this one slot. */
interface StreamHighlight {
  messageId: string;
  phase: Exclude<ChatMessageHighlightPhase, "idle">;
  /** Why a show failed. */
  reason?: string;
}

/** Buddy, when the window has one: its tab and its pane. */
interface StreamManagerBuddy {
  /** The Buddy's name, on its tab: "Orcle". */
  name: string;
  /** Its presence: `good` while listening, `warn` paused or flagged, `error` on a problem. */
  tone?: StatusDotTone;
  /** The dot in words, read aloud: "Buddy is listening". */
  toneLabel?: string;
  /** New questions and cards while the pane sits behind a tab. */
  unseen?: number;
  /** The Buddy pane. */
  pane: ReactNode;
}

interface StreamManagerProps {
  /** The window's title: the title row carries it and nothing else. */
  title?: string;
  /** `darwin`, `win32`, `linux`…: the traffic-light gutter and how keys are printed. */
  platform?: string;
  /** A live session: highlights, the composer and hover timestamps. */
  live?: boolean;
  /** A finished session, read back: its own bar under the title. */
  history?: { title: string; date: string; onBackToLive?: () => void };

  stats: readonly StatItem[];
  statsLayout?: StatsLayout;
  onStatsLayoutChange?: (layout: StatsLayout) => void;
  /** The screen is hidden from viewers. */
  screenHidden?: boolean;

  messages: readonly ChatMessageData[];
  destinations: readonly ChatDestination[];
  /** The streamer's own account names: mentions and the Mentions filter. */
  mentionNames?: readonly string[];
  /** Messages behind Buddy's open questions: the Questions filter. */
  questionIds?: ReadonlySet<string>;
  /** The message on stream now, or on its way. */
  highlight?: StreamHighlight | null;
  /** Puts a message on stream, or takes it off. Live only. */
  onHighlight?: (message: ChatMessageData) => void;
  removals?: Readonly<Record<string, ChatMessageRemoval>>;
  flags?: Readonly<Record<string, ChatMessageFlag>>;
  suggestedIds?: ReadonlySet<string>;
  /** The message the streamer is talking about, as Buddy heard. */
  spotlightId?: string | null;
  onRemoveFromChat?: (message: ChatMessageData) => void;

  /** Sends from the composer. The composer shows while live. */
  onSend?: (text: string, options: ChatSendOptions) => void;
  sendPending?: boolean;
  sendFailures?: readonly ChatSendFailure[];
  onRetrySend?: () => void;
  composerCommands?: readonly ChatComposerCommand[];
  onComposerCommand?: (text: string) => void;
  composerNotice?: ReactNode;
  composerPlaceholder?: string;

  activity?: readonly ActivityItem[];
  activityNote?: string | null;
  onShowActivityOnStream?: (item: ActivityItem) => void;
  /** Thank in chat: the composer is prefilled with your thanks. */
  thankYouDraft?: (item: ActivityItem) => string;
  twitchNeeds?: ActivityFeedProps["twitchNeeds"];
  onReconnectTwitch?: () => void;
  autoShow?: boolean;
  onAutoShowChange?: (on: boolean) => void;

  buddy?: StreamManagerBuddy;
  /** What arrived while a pane sat behind its tab. */
  unseen?: { chat?: number; activity?: number };

  pinned?: boolean;
  onPinnedChange?: (pinned: boolean) => void;
  destinationNotes?: StreamManagerStatusBarProps["destinationNotes"];
  highlightPosition?: StreamManagerStatusBarProps["highlightPosition"];
  onHighlightPositionChange?: StreamManagerStatusBarProps["onHighlightPositionChange"];
  onMarkClip?: StreamManagerStatusBarProps["onMarkClip"];
  onScreenPrivacy?: (hidden: boolean) => void;
  banners?: StreamManagerStatusBarProps["banners"];
  onBanner?: StreamManagerStatusBarProps["onBanner"];
  onClear?: () => void;
  onOpenPreview?: () => void;
  className?: string;
}

/** A tab's label: a status dot, the name, and what arrived behind it. */
function PaneLabel({
  label,
  unseen = 0,
  dot,
  dotLabel,
}: {
  label: string;
  unseen?: number;
  dot?: StatusDotTone;
  /** What the dot means, read aloud: never colour alone. */
  dotLabel?: string;
}): ReactElement {
  return (
    <span className="flex items-center gap-1.5">
      {dot ? (
        <span
          aria-label={dotLabel}
          className="flex"
          role={dotLabel ? "img" : undefined}
        >
          <StatusDot tone={dot} />
        </span>
      ) : null}
      {label}
      {unseen > 0 ? (
        <Badge variant="outline">{unseen > 99 ? "99+" : unseen}</Badge>
      ) : null}
    </span>
  );
}

const NO_IDS: ReadonlySet<string> = new Set();
const NO_NAMES: readonly string[] = [];
const NO_ITEMS: readonly ActivityItem[] = [];
/** Within this many pixels of the bottom, chat follows new messages. */
const FOLLOW_SLACK_PX = 48;

/** A message's highlight, from the window's one slot. */
function highlightFor(
  id: string | undefined,
  highlight: StreamHighlight | null | undefined
): ChatMessageHighlight {
  if (!id || !highlight || highlight.messageId !== id) {
    return { phase: "idle" };
  }
  return { phase: highlight.phase, reason: highlight.reason };
}

/** The element that scrolls inside a ScrollArea. */
const viewportOf = (root: HTMLElement | null): HTMLElement | null =>
  root?.querySelector<HTMLElement>("[data-slot=scroll-area-viewport]") ?? null;

/** Chat stays on the newest message until the streamer scrolls up. */
function useFollowNewest(count: number) {
  const rootRef = useRef<HTMLDivElement>(null);
  const following = useRef(true);
  useEffect(() => {
    const element = viewportOf(rootRef.current);
    if (!element) {
      return;
    }
    const onScroll = (): void => {
      following.current =
        element.scrollHeight - element.scrollTop - element.clientHeight <
        FOLLOW_SLACK_PX;
    };
    element.addEventListener("scroll", onScroll, { passive: true });
    return () => element.removeEventListener("scroll", onScroll);
  }, [rootRef]);
  useLayoutEffect(() => {
    const element = viewportOf(rootRef.current);
    if (element && following.current && count >= 0) {
      element.scrollTop = element.scrollHeight;
    }
  }, [count, rootRef]);
  return rootRef;
}

interface ChatPaneProps {
  props: StreamManagerProps;
  filter: ChatFilter;
  onFilterChange: (filter: ChatFilter) => void;
  draft: string;
  onDraftChange: (draft: string) => void;
  searchRef: RefObject<HTMLInputElement | null>;
  composerRef: RefObject<HTMLInputElement | null>;
  className: string;
}

/** Chat: the filters, the big-text rows, and the composer while live. */
function ChatPane({
  props,
  filter,
  onFilterChange,
  draft,
  onDraftChange,
  searchRef,
  composerRef,
  className,
}: ChatPaneProps): ReactElement {
  const {
    live = false,
    messages,
    destinations,
    mentionNames = NO_NAMES,
    questionIds = NO_IDS,
    highlight,
    onHighlight,
    removals,
    flags,
    suggestedIds,
    spotlightId = null,
    onRemoveFromChat,
    onSend,
    platform,
  } = props;
  const platforms = [
    ...new Set<ChatPlatform>([
      ...destinations.map((destination) => destination.platform),
      ...messages.map((message) => message.platform),
    ]),
  ];
  const shown = filterChatMessages(messages, filter, {
    mentionNames,
    questionIds,
  });
  const listRef = useFollowNewest(shown.length);
  let empty = live
    ? "Chat is connected. New messages appear here."
    : "Start a livestream to see chat here.";
  if (chatFilterActive(filter)) {
    empty = "No messages match these filters.";
  }
  return (
    <section
      aria-label="Chat"
      className={cn("min-h-0 flex-1 flex-col", className)}
      data-pane="chat"
      data-slot="chat-pane"
    >
      <ChatToolbar
        filter={filter}
        onFilterChange={onFilterChange}
        platform={platform}
        platforms={platforms}
        questions={questionIds.size > 0}
        searchRef={searchRef}
      />
      <div className="relative flex min-h-0 flex-1 flex-col" ref={listRef}>
        <ScrollArea className="min-h-0 flex-1">
          {shown.length > 0 ? (
            <ol
              aria-label="Chat messages"
              className="flex flex-col gap-1 px-2 py-1"
            >
              {shown.map((message) => (
                <ChatMessage
                  flag={flags?.[message.id]}
                  highlight={highlightFor(message.id, highlight)}
                  key={message.id}
                  mentionNames={mentionNames}
                  message={message}
                  onHighlight={live ? onHighlight : undefined}
                  onRemoveFromChat={live ? onRemoveFromChat : undefined}
                  onReply={
                    live && onSend
                      ? (target) => {
                          onDraftChange(`@${target.authorName} `);
                          composerRef.current?.focus();
                        }
                      : undefined
                  }
                  removal={removals?.[message.id]}
                  spotlight={spotlightId === message.id}
                  suggested={suggestedIds?.has(message.id) ?? false}
                  timestamps={live ? "hover" : "always"}
                />
              ))}
            </ol>
          ) : (
            <Empty className="h-full">
              <EmptyHeader>
                <EmptyDescription>{empty}</EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}
        </ScrollArea>
      </div>
      {live && onSend ? (
        <ChatComposer
          commands={props.composerCommands}
          destinations={destinations}
          failures={props.sendFailures}
          inputRef={composerRef}
          notice={props.composerNotice}
          onCommand={props.onComposerCommand}
          onRetry={props.onRetrySend}
          onSend={onSend}
          onValueChange={onDraftChange}
          pending={props.sendPending}
          placeholder={props.composerPlaceholder}
          platform={platform}
          value={draft}
        />
      ) : null}
    </section>
  );
}

/** The tabs over the panes: Chat, Activity, Buddy below Wide; Activity, Buddy at Wide. */
function PaneTabs({
  wide,
  value,
  onValueChange,
  unseen,
  buddy,
}: {
  wide: boolean;
  value: StreamManagerPane;
  onValueChange: (pane: StreamManagerPane) => void;
  unseen?: { chat?: number; activity?: number };
  buddy?: StreamManagerBuddy;
}): ReactElement {
  return (
    <div
      className={cn(
        "border-border row-start-1 items-center border-b px-2 py-1.5",
        wide ? cn("col-start-2 border-l", WIDE_ONLY) : cn("flex", BELOW_WIDE)
      )}
      data-slot={wide ? "pane-tabs-wide" : "pane-tabs"}
    >
      <Tabs
        onValueChange={(next) => onValueChange(next as StreamManagerPane)}
        value={value}
      >
        <TabsList>
          {wide ? null : (
            <TabsTrigger value="chat">
              <PaneLabel label="Chat" unseen={unseen?.chat} />
            </TabsTrigger>
          )}
          <TabsTrigger value="activity">
            <PaneLabel label="Activity" unseen={unseen?.activity} />
          </TabsTrigger>
          {buddy ? (
            <TabsTrigger value="buddy">
              <PaneLabel
                dot={buddy.tone ?? "neutral"}
                dotLabel={buddy.toneLabel}
                label={buddy.name}
                unseen={buddy.unseen}
              />
            </TabsTrigger>
          ) : null}
        </TabsList>
      </Tabs>
    </div>
  );
}

/** Activity, as the window shows it: live actions only while live. */
function ActivityPane({
  props,
  items,
  onThank,
  className,
}: {
  props: StreamManagerProps;
  items: readonly ActivityItem[];
  onThank?: (item: ActivityItem) => void;
  className: string;
}): ReactElement {
  const { live = false, history, destinations } = props;
  return (
    <div className={cn("min-h-0 flex-col", className)} data-pane="activity">
      <ActivityFeed
        autoShow={props.autoShow}
        items={items}
        note={props.activityNote}
        onAutoShowChange={history ? undefined : props.onAutoShowChange}
        onReconnectTwitch={history ? undefined : props.onReconnectTwitch}
        onShowOnStream={live ? props.onShowActivityOnStream : undefined}
        onThank={onThank}
        platforms={[
          ...new Set(destinations.map((destination) => destination.platform)),
        ]}
        timestamps={live ? "hover" : "always"}
        twitchNeeds={props.twitchNeeds}
      />
    </div>
  );
}

/** A finished session's bar under the title: its name, its day, and the way back. */
function HistoryBar({
  history,
}: {
  history: NonNullable<StreamManagerProps["history"]>;
}): ReactElement {
  return (
    <div
      className="border-border flex h-8 shrink-0 items-center gap-2 border-b px-3 text-xs"
      data-slot="history-bar"
    >
      <span className="text-muted-foreground min-w-0 flex-1 truncate">
        {history.title} · {history.date}
      </span>
      {history.onBackToLive ? (
        <Button
          className="shrink-0"
          onClick={() => history.onBackToLive?.()}
          size="xs"
          type="button"
          variant="ghost"
        >
          Back to live
        </Button>
      ) : null}
    </div>
  );
}

/** ⌘F searches chat, ⌘L writes in it and ⌘J brings Buddy forward, while focus is in the window. */
function windowKey(
  event: KeyboardEvent<HTMLElement>
): "search" | "write" | "buddy" | null {
  if (!(event.metaKey || event.ctrlKey) || event.shiftKey || event.altKey) {
    return null;
  }
  switch (event.key.toLowerCase()) {
    case "f": {
      return "search";
    }
    case "l": {
      return "write";
    }
    case "j": {
      return "buddy";
    }
    default: {
      return null;
    }
  }
}

/**
 * The whole window: the title row, the stats bar, Chat beside Activity and
 * Buddy, and the status bar. Presentational: your app owns the session, and
 * every action is a callback.
 */
function StreamManager(props: StreamManagerProps): ReactElement {
  const {
    title = "Stream Manager",
    platform,
    live = false,
    history,
    stats,
    statsLayout,
    onStatsLayoutChange,
    screenHidden = false,
    destinations,
    highlight,
    onSend,
    activity = NO_ITEMS,
    buddy,
    unseen,
    thankYouDraft,
    className,
  } = props;
  const [narrowPane, setNarrowPane] = useState<StreamManagerPane>("chat");
  const [rightPane, setRightPane] =
    useState<StreamManagerRightPane>("activity");
  const [filter, setFilter] = useState<ChatFilter>(DEFAULT_CHAT_FILTER);
  const [draft, setDraft] = useState("");
  const [focusRequest, setFocusRequest] = useState<{
    target: "search" | "write";
    seq: number;
  } | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const composerRef = useRef<HTMLInputElement>(null);
  const composerAvailable = live && Boolean(onSend);

  // The pane is shown first, so the focus lands on a visible field.
  useEffect(() => {
    if (!focusRequest) {
      return;
    }
    const field =
      focusRequest.target === "search"
        ? searchRef.current
        : composerRef.current;
    field?.focus();
  }, [focusRequest]);

  const focusChat = (target: "search" | "write"): void => {
    setNarrowPane("chat");
    setFocusRequest((current) => ({ seq: (current?.seq ?? 0) + 1, target }));
  };
  const showBuddy = (): void => {
    setNarrowPane("buddy");
    setRightPane("buddy");
  };
  const onKeyDown = (event: KeyboardEvent<HTMLElement>): void => {
    const key = windowKey(event);
    if (
      !key ||
      (key === "write" && !composerAvailable) ||
      (key === "buddy" && !buddy)
    ) {
      return;
    }
    event.preventDefault();
    if (key === "buddy") {
      showBuddy();
    } else {
      focusChat(key === "search" ? "search" : "write");
    }
  };

  const items = activity.map((item) =>
    item.messageId && highlight?.messageId === item.messageId
      ? { ...item, highlight: highlightFor(item.messageId, highlight) }
      : item
  );
  const thank =
    live && onSend && thankYouDraft
      ? (item: ActivityItem) => {
          setDraft(thankYouDraft(item));
          focusChat("write");
        }
      : undefined;

  return (
    <WindowFrame className={cn("text-foreground relative", className)}>
      {/* overflow-hidden: the window never scrolls, each pane scrolls itself. */}
      {/* oxlint-disable-next-line jsx-a11y/no-static-element-interactions -- The window's keys, while focus is inside it; each one has a button in the status bar. */}
      <div
        className="@container/stream-manager relative flex h-full flex-col overflow-hidden"
        data-slot="stream-manager"
        onKeyDown={onKeyDown}
      >
        {/* The title row carries the title only: the stats bar says ON AIR,
            and History has its own bar. */}
        <WindowHeader platform={platform} title={title} />
        {history ? <HistoryBar history={history} /> : null}
        <StreamStatsBar
          items={stats}
          layout={statsLayout}
          onLayoutChange={onStatsLayoutChange}
          screenHidden={screenHidden}
        />
        <div className={PANES_GRID} data-slot="stream-manager-panes">
          <PaneTabs
            buddy={buddy}
            onValueChange={setNarrowPane}
            unseen={unseen}
            value={narrowPane}
            wide={false}
          />
          <PaneTabs
            buddy={buddy}
            onValueChange={(pane) =>
              setRightPane(pane === "chat" ? "activity" : pane)
            }
            unseen={unseen}
            value={rightPane}
            wide
          />
          <ChatPane
            className={paneClasses("chat", narrowPane, rightPane)}
            composerRef={composerRef}
            draft={draft}
            filter={filter}
            onDraftChange={setDraft}
            onFilterChange={setFilter}
            props={props}
            searchRef={searchRef}
          />
          <ActivityPane
            className={paneClasses("activity", narrowPane, rightPane)}
            items={items}
            onThank={thank}
            props={props}
          />
          {buddy ? (
            <div
              className={cn(
                "min-h-0 flex-col overflow-y-auto",
                paneClasses("buddy", narrowPane, rightPane)
              )}
              data-pane="buddy"
            >
              {buddy.pane}
            </div>
          ) : null}
        </div>
        <StreamManagerStatusBar
          banners={props.banners}
          destinationNotes={props.destinationNotes}
          destinations={destinations}
          highlightPosition={history ? undefined : props.highlightPosition}
          onBanner={props.onBanner}
          onClear={props.onClear}
          onFocusBuddy={buddy ? showBuddy : undefined}
          onHighlightPositionChange={
            history ? undefined : props.onHighlightPositionChange
          }
          onMarkClip={live ? props.onMarkClip : undefined}
          onOpenPreview={props.onOpenPreview}
          onPinnedChange={props.onPinnedChange}
          onScreenPrivacy={props.onScreenPrivacy}
          onSearchChat={() => focusChat("search")}
          onStatsLayoutChange={onStatsLayoutChange}
          onWriteInChat={
            composerAvailable ? () => focusChat("write") : undefined
          }
          pinned={props.pinned}
          platform={platform}
          screenHidden={screenHidden}
          statsLayout={statsLayout}
        />
      </div>
    </WindowFrame>
  );
}

export {
  StreamManager,
  paneClasses,
  type StreamHighlight,
  type StreamManagerBuddy,
  type StreamManagerPane,
  type StreamManagerProps,
};
