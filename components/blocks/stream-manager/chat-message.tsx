"use client";

import { useId } from "react";
import type { CSSProperties, ReactElement, Ref } from "react";

import {
  CHAT_PLATFORM_LABELS,
  ChatPlatformIcon,
} from "@/components/blocks/stream-manager/chat-platform";
import type { ChatPlatform } from "@/components/blocks/stream-manager/chat-platform";
import {
  CopyIcon,
  DeleteIcon,
  LivestreamIcon,
  MicrophoneIcon,
  SendIcon,
  SparkleIcon,
} from "@/components/icons";
import { KebabMenu } from "@/components/kebab-menu";
import type { KebabMenuItem } from "@/components/kebab-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CHROME_ROW_CLASS } from "@/components/ui/chrome-row";
import { Spinner } from "@/components/ui/spinner";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

// One chat message in the Stream Manager: the big-text row. A click on it
// puts the message on stream, and a click on the row that is on stream takes
// it off; the ⋯ menu holds the rest. A row paints at most one background,
// lowest to highest: a member's plate, Buddy's "Talking about this", a paid
// message's fill and ring; the row on stream wears the live chrome plate,
// which no tint shares. Text stays monochrome.

/** What a row is: a viewer's message or one of the platform's own lines. */
type ChatMessageKind =
  | "message"
  | "paid"
  | "membership"
  | "system"
  | "moderation";

type ChatAuthorRole = "owner" | "moderator" | "vip" | "member";

/** One message, as plain data. */
interface ChatMessageData {
  id: string;
  platform: ChatPlatform;
  authorName: string;
  /** Initials show until it loads, and when there is none. */
  authorAvatarUrl?: string;
  authorRoles?: readonly ChatAuthorRole[];
  text: string;
  /** `message` when absent. */
  kind?: ChatMessageKind;
  /** A paid message's amount: "$5.00". It paints the paid tint. */
  amountText?: string;
  /** The viewer's first message in this channel. */
  firstMessage?: boolean;
  /** The message it answers. */
  reply?: { authorName: string; text: string };
  /** Removed from chat: struck through, and never put on stream. */
  deleted?: boolean;
  /** The time as the row shows it: "8:42 PM" (see `formatChatTime`). */
  time?: string;
  /** When it arrived, as an ISO string, for the `<time>` element. */
  receivedAt?: string;
}

type ChatMessageHighlightPhase = "idle" | "applying" | "live" | "failed";

/** The row's place on stream. */
interface ChatMessageHighlight {
  phase: ChatMessageHighlightPhase;
  /** Why a show failed: the row's own line while the badge says Failed. */
  reason?: string;
  /** A failed action on a message already on stream. */
  commandError?: string;
}

type ChatMessageRemovalKind =
  | "removing"
  | "removed"
  | "hidden"
  | "failed"
  | "unknown";

/** A "Remove from chat" on this row: running, done, or what went wrong. */
interface ChatMessageRemoval {
  kind: ChatMessageRemovalKind;
  /** The outcome in one sentence: on hover for a plain removal, the row's own line otherwise. */
  detail?: string | null;
}

/** What Buddy flagged on this message. A flag never moderates by itself. */
interface ChatMessageFlag {
  /** The chip: "Spam", "Rude to @maya". */
  label: string;
  /** The chip's hover: why Buddy flagged it. */
  detail: string;
  /** `high` tints the chip. */
  severity?: "high" | "low";
  /** A suggested action, as a quiet word after the chip: "Remove?". */
  action?: string;
}

const REMOVAL_LABELS: Readonly<Record<ChatMessageRemovalKind, string>> = {
  failed: "Not removed",
  hidden: "Hidden in Videorc",
  removed: "Removed",
  removing: "Removing…",
  unknown: "Unconfirmed",
};

const ROLE_LABELS: Readonly<Record<ChatAuthorRole, string>> = {
  member: "Member",
  moderator: "Mod",
  owner: "Host",
  vip: "VIP",
};

/** The one label a removal carries everywhere: only it may say "remove". */
const REMOVE_FROM_CHAT_LABEL = "Remove from chat";

/** "8:42 PM": the row's time, in the reader's locale. */
function formatChatTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

/** Initials for the avatar's fallback: the first letters of up to two words. */
function chatMessageInitials(name: string): string {
  const words = name.trim().split(/\s+/u).filter(Boolean);
  const initials = words
    .slice(0, 2)
    .map((word) => [...word][0]?.toUpperCase() ?? "")
    .join("");
  return initials || "?";
}

/** True when a viewer's message names one of the streamer's own accounts. */
function chatMessageMentions(
  message: Pick<ChatMessageData, "kind" | "text">,
  names: readonly string[]
): boolean {
  if (names.length === 0 || (message.kind ?? "message") !== "message") {
    return false;
  }
  const text = message.text.toLowerCase();
  return names.some((name) => {
    const handle = name.trim().toLowerCase().replace(/^@/u, "");
    return handle.length > 1 && text.includes(`@${handle}`);
  });
}

/** Moderation lines, the platform's own notices and removed messages never go on stream. */
function chatMessageCanHighlight(message: ChatMessageData): boolean {
  const kind = message.kind ?? "message";
  return !message.deleted && kind !== "moderation" && kind !== "system";
}

type ChatMessageTint = "paid" | "spotlight" | "member";

/** The row's one tint, if any. The row on stream has none: its plate wins. */
function chatMessageTint(
  message: ChatMessageData,
  { spotlight, onStream }: { spotlight: boolean; onStream: boolean }
): ChatMessageTint | null {
  if (onStream) {
    return null;
  }
  if (message.amountText) {
    return "paid";
  }
  if (spotlight) {
    return "spotlight";
  }
  const kind = message.kind ?? "message";
  const viewerRow =
    kind === "message" || kind === "paid" || kind === "membership";
  if (
    viewerRow &&
    !message.deleted &&
    message.authorRoles?.includes("member")
  ) {
    return "member";
  }
  return null;
}

/** A paid row is a fill and a hairline ring; a member's row is one notch quieter. */
const TINT_CLASS: Readonly<Record<ChatMessageTint, string>> = {
  member: CHROME_ROW_CLASS.member,
  paid: "bg-warning/10 ring-1 ring-warning/30",
  spotlight: "bg-accent",
};

function rowSurfaceClass(
  tint: ChatMessageTint | null,
  onStream: boolean
): string | null {
  if (onStream) {
    return CHROME_ROW_CLASS.live;
  }
  return tint ? TINT_CLASS[tint] : null;
}

/** Why a highlight didn't land, as the row's own line. */
function highlightProblem(highlight: ChatMessageHighlight): string | null {
  if (highlight.phase === "failed") {
    return highlight.reason?.trim() || null;
  }
  if (highlight.phase === "live") {
    return highlight.commandError?.trim() || null;
  }
  return null;
}

/** What a removal did when it didn't simply remove, as the row's own line. */
function removalOutcome(removal: ChatMessageRemoval | null | undefined) {
  if (!removal || removal.kind === "removing" || removal.kind === "removed") {
    return null;
  }
  return removal.detail?.trim() || null;
}

/** A chip's explanation on hover, never a native `title`. */
function ChipHint({
  hint,
  children,
}: {
  hint: string;
  children: ReactElement;
}): ReactElement {
  return (
    <Tooltip>
      <TooltipTrigger render={children} />
      <TooltipContent>{hint}</TooltipContent>
    </Tooltip>
  );
}

/**
 * The on-stream badge, shared by chat and Activity rows: "Applying…",
 * "On stream" or "Failed". A failure's reason is the row's own line.
 */
function HighlightStatus({
  highlight,
}: {
  highlight: ChatMessageHighlight;
}): ReactElement | null {
  switch (highlight.phase) {
    case "applying": {
      return <Badge>Applying…</Badge>;
    }
    case "live": {
      return (
        <span className="flex items-center gap-1">
          <Badge variant="chrome">On stream</Badge>
          {highlight.commandError ? (
            <Badge variant="destructive">Action failed</Badge>
          ) : null}
        </span>
      );
    }
    case "failed": {
      return <Badge variant="destructive">Failed</Badge>;
    }
    default: {
      return null;
    }
  }
}

/**
 * A removal's chip: "Removing…" while it runs, then "Removed", "Hidden in
 * Videorc", or a quiet "Not removed" or "Unconfirmed". Outside the
 * struck-through text, so it stays readable.
 */
function RemovalStatus({
  removal,
}: {
  removal: ChatMessageRemoval | null | undefined;
}): ReactElement | null {
  if (!removal) {
    return null;
  }
  if (removal.kind === "removing") {
    return (
      <Badge data-removal={removal.kind}>
        <Spinner aria-hidden data-icon="inline-start" weight="bold" />
        {REMOVAL_LABELS.removing}
      </Badge>
    );
  }
  const chip = (
    <Badge className="shrink-0" data-removal={removal.kind} variant="outline">
      {REMOVAL_LABELS[removal.kind]}
    </Badge>
  );
  return removal.kind === "removed" && removal.detail ? (
    <ChipHint hint={removal.detail}>{chip}</ChipHint>
  ) : (
    chip
  );
}

/** Buddy's mark on the row: a flag, "Talking about this", or "Suggested". */
function BuddyMark({
  flag,
  spotlight,
  suggested,
}: {
  flag?: ChatMessageFlag;
  spotlight: boolean;
  suggested: boolean;
}): ReactElement | null {
  if (flag) {
    return (
      <span
        className="flex min-w-0 items-center gap-1"
        data-slot="chat-message-flag"
      >
        <ChipHint hint={flag.detail}>
          <Badge
            className="max-w-40"
            variant={flag.severity === "high" ? "destructive" : "outline"}
          >
            <span className="truncate">{flag.label}</span>
          </Badge>
        </ChipHint>
        {flag.action ? (
          <span className="text-label text-muted-foreground shrink-0 font-normal">
            {flag.action}
          </span>
        ) : null}
      </span>
    );
  }
  if (spotlight) {
    // Private to the streamer: never on stream by itself.
    return (
      <ChipHint hint="Buddy heard you talking about this message">
        <Badge variant="outline">
          <MicrophoneIcon aria-hidden data-icon="inline-start" weight="fill" />
          Talking about this
        </Badge>
      </ChipHint>
    );
  }
  if (!suggested) {
    return null;
  }
  return (
    <ChipHint hint="Buddy suggests showing this message on the stream">
      <Badge variant="outline">
        <SparkleIcon aria-hidden data-icon="inline-start" weight="fill" />
        Suggested
      </Badge>
    </ChipHint>
  );
}

/** A paid amount, a new member, or the platform's own line. */
function EventStatus({
  message,
}: {
  message: ChatMessageData;
}): ReactElement | null {
  if (message.amountText) {
    return <Badge variant="warning">{message.amountText}</Badge>;
  }
  switch (message.kind) {
    case "membership": {
      return <Badge variant="plate">Member</Badge>;
    }
    case "moderation": {
      return <Badge>Moderation</Badge>;
    }
    case "system": {
      return <Badge>System</Badge>;
    }
    default: {
      return null;
    }
  }
}

/** Role tags as glass chips; Member is a chrome plate. */
function RoleTags({
  roles,
}: {
  roles: readonly ChatAuthorRole[];
}): ReactElement | null {
  const labels = [...new Set(roles.map((role) => ROLE_LABELS[role]))];
  if (labels.length === 0) {
    return null;
  }
  return (
    <>
      {labels.map((label) => (
        <Badge
          className="shrink-0"
          key={label}
          variant={label === ROLE_LABELS.member ? "plate" : "outline"}
        >
          {label}
        </Badge>
      ))}
    </>
  );
}

interface ChatMessageMenuOptions {
  highlightable: boolean;
  highlightPhase: ChatMessageHighlightPhase;
  onHighlight?: (message: ChatMessageData) => void;
  onReply?: (message: ChatMessageData) => void;
  onCopy?: (message: ChatMessageData) => void;
  onRemoveFromChat?: (message: ChatMessageData) => void;
  removeFromChatReason?: string | null;
}

const copyToClipboard = (message: ChatMessageData): void => {
  // Best effort: a page without clipboard access copies nothing.
  navigator.clipboard
    ?.writeText(`${message.authorName}: ${message.text}`)
    .catch(() => null);
};

/**
 * The row's ⋯ menu: show on (or take off) stream, reply, copy, and, for a
 * row that can be removed, "Remove from chat": destructive, last, below a
 * hairline. The stream toggle says "Take off stream", never "Remove": only
 * the irreversible item may say remove. A row the account can't remove on
 * its platform keeps the item, disabled with the fix on hover.
 */
function chatMessageMenu(
  message: ChatMessageData,
  {
    highlightable,
    highlightPhase,
    onHighlight,
    onReply,
    onCopy = copyToClipboard,
    onRemoveFromChat,
    removeFromChatReason = null,
  }: ChatMessageMenuOptions
): KebabMenuItem[] {
  const kind = message.kind ?? "message";
  const items: KebabMenuItem[] = [];
  if (highlightable) {
    items.push({
      icon: LivestreamIcon,
      id: "show",
      label: highlightPhase === "live" ? "Take off stream" : "Show on stream",
      onSelect: () => onHighlight?.(message),
    });
  }
  if (onReply && (kind === "message" || kind === "paid")) {
    items.push({
      icon: SendIcon,
      id: "reply",
      label: "Reply",
      onSelect: () => onReply(message),
    });
  }
  items.push({
    icon: CopyIcon,
    id: "copy",
    label: "Copy",
    onSelect: () => onCopy(message),
  });
  if (onRemoveFromChat || removeFromChatReason) {
    items.push({
      destructive: true,
      disabled: !onRemoveFromChat,
      disabledReason: removeFromChatReason,
      icon: DeleteIcon,
      id: "remove-from-chat",
      label: REMOVE_FROM_CHAT_LABEL,
      onSelect: () => onRemoveFromChat?.(message),
    });
  }
  return items;
}

/** What the row's button does, then any outcome its own lines show. */
function rowDescription(
  highlight: ChatMessageHighlight,
  removal: ChatMessageRemoval | null | undefined,
  suggested: boolean
): string {
  let action = "Shows it on stream";
  if (highlight.phase === "live") {
    action = "Takes it off the stream";
  } else if (suggested) {
    action = "Shows it on stream. Buddy suggests it";
  }
  const outcomes = [
    highlightProblem(highlight),
    removalOutcome(removal),
  ].filter(Boolean);
  return outcomes.length > 0 ? `${action}. ${outcomes.join(" ")}` : action;
}

type ChatMessageDensity = "compact" | "comfortable";
type ChatMessageTimestamps = "always" | "hover";

interface ChatMessageContentProps {
  message: ChatMessageData;
  density: ChatMessageDensity;
  timestamps: ChatMessageTimestamps;
  highlight: ChatMessageHighlight;
  removal?: ChatMessageRemoval | null;
  flag?: ChatMessageFlag;
  suggested: boolean;
  spotlight: boolean;
  mentioned: boolean;
  /** The parts a highlightable row's button is named by: who, where, what. */
  nameIds?: { author: string; platform: string; text: string };
}

function ChatMessageContent({
  message,
  density,
  timestamps,
  highlight,
  removal,
  flag,
  suggested,
  spotlight,
  mentioned,
  nameIds,
}: ChatMessageContentProps): ReactElement {
  const kind = message.kind ?? "message";
  const problem = highlightProblem(highlight);
  const outcome = removalOutcome(removal);
  return (
    <>
      {/* Sized with the 20 px platform marks: 32 px in a compact rail, 40 px
          (both lines) in the Stream Manager. */}
      <Avatar
        aria-hidden
        className="mt-0.5"
        size={density === "comfortable" ? "lg" : "default"}
      >
        {message.authorAvatarUrl ? (
          <AvatarImage alt="" src={message.authorAvatarUrl} />
        ) : null}
        <AvatarFallback>
          {chatMessageInitials(message.authorName)}
        </AvatarFallback>
      </Avatar>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="flex min-w-0 items-center gap-1.5">
          {/* text-left: a highlightable row is a Button, whose centred text
              would float the name away from the avatar. */}
          <span
            className="text-foreground min-w-0 truncate text-left font-medium"
            data-slot="chat-message-author"
            id={nameIds?.author}
          >
            {message.authorName}
          </span>
          <RoleTags roles={message.authorRoles ?? []} />
          {message.firstMessage ? (
            <Badge className="shrink-0" variant="outline">
              <SparkleIcon aria-hidden data-icon="inline-start" weight="fill" />
              First chat
            </Badge>
          ) : null}
          {mentioned ? (
            <ChipHint hint="Mentions you">
              <Badge className="shrink-0">@you</Badge>
            </ChipHint>
          ) : null}
          <span className="flex-1" />
          <EventStatus message={message} />
          <BuddyMark flag={flag} spotlight={spotlight} suggested={suggested} />
          <HighlightStatus highlight={highlight} />
          <RemovalStatus removal={removal} />
          {message.time ? (
            // While live the time waits for the pointer, like the ⋯: a clock
            // on every row is noise mid-stream.
            <time
              className={cn(
                "text-label text-muted-foreground ml-auto shrink-0 font-normal tabular-nums",
                timestamps === "hover" &&
                  "opacity-0 group-focus-within/chat-message:opacity-100 group-hover/chat-message:opacity-100"
              )}
              dateTime={message.receivedAt}
            >
              {message.time}
            </time>
          ) : null}
          {/* The platform mark closes the line on the far right, clear of the name. */}
          <ChatPlatformIcon
            className="mr-0 ml-1"
            decorative
            platform={message.platform}
          />
          {nameIds ? (
            // The mark's words, for the row button's name only ("Ada on
            // YouTube: Ship it!"): a hidden node still counts when
            // aria-labelledby points at it.
            <span hidden id={nameIds.platform}>
              {`on ${CHAT_PLATFORM_LABELS[message.platform]}:`}
            </span>
          ) : null}
        </span>
        {message.reply ? (
          <span
            className="text-muted-foreground truncate text-left text-xs"
            data-slot="chat-message-reply"
          >
            ↳ @{message.reply.authorName}: {message.reply.text}
          </span>
        ) : null}
        <span
          className={cn(
            "text-foreground text-left wrap-break-word select-text",
            density === "comfortable" ? COMFORTABLE_TEXT : COMPACT_TEXT,
            (kind === "system" || kind === "moderation") &&
              "text-muted-foreground italic",
            message.deleted && "text-muted-foreground line-through"
          )}
          data-slot="chat-message-text"
          id={nameIds?.text}
        >
          {message.text}
        </span>
        {problem ? (
          <span
            className="text-muted-foreground text-left text-xs"
            data-slot="chat-message-problem"
          >
            {problem}
          </span>
        ) : null}
        {outcome ? (
          <span
            className="text-muted-foreground text-left text-xs"
            data-slot="chat-message-outcome"
          >
            {outcome}
          </span>
        ) : null}
      </span>
    </>
  );
}

// The Stream Manager keeps the big-text rows: 15 px, between the type
// scale's 14 and 16. A compact rail sets 12 px.
// oxlint-disable-next-line shadcn/no-arbitrary-values -- see above.
const COMFORTABLE_TEXT = "text-[15px] leading-snug";
const COMPACT_TEXT = "text-xs leading-relaxed";

// A highlightable row is one ghost Button laid out as the row: avatar, lines
// and time, top-aligned and wrapping.
const ROW_BUTTON_CLASS =
  // oxlint-disable-next-line shadcn/no-restyle -- see above.
  "h-auto w-full min-w-0 flex-1 items-start justify-start gap-2 px-2 py-1.5 whitespace-normal";

const IDLE: ChatMessageHighlight = { phase: "idle" };
const NO_NAMES: readonly string[] = [];

interface ChatMessageProps {
  message: ChatMessageData;
  /** `comfortable` (the Stream Manager's 15 px text) or `compact` (a 12 px rail). */
  density?: ChatMessageDensity;
  /** `hover` keeps the time out of sight until the pointer is on the row (while live). */
  timestamps?: ChatMessageTimestamps;
  highlight?: ChatMessageHighlight;
  removal?: ChatMessageRemoval | null;
  /** Buddy flagged it. */
  flag?: ChatMessageFlag;
  /** Buddy suggests showing it on stream. */
  suggested?: boolean;
  /** The streamer is talking about it, as Buddy heard. */
  spotlight?: boolean;
  /** The streamer's own account names: a message naming one is a mention. */
  mentionNames?: readonly string[];
  /** Makes the row a button that puts the message on stream, or takes it off. */
  onHighlight?: (message: ChatMessageData) => void;
  onReply?: (message: ChatMessageData) => void;
  /** Copies "Author: text" to the clipboard when absent. */
  onCopy?: (message: ChatMessageData) => void;
  /** Pass it only for a row that can be removed now. */
  onRemoveFromChat?: (message: ChatMessageData) => void;
  /** Why Remove from chat is off for this row: the item stays, disabled, with the fix on hover. */
  removeFromChatReason?: string | null;
  /** A list's roving focus: 0 on the active row, -1 on the others. The ⋯ follows it. */
  tabIndex?: number;
  ref?: Ref<HTMLLIElement>;
  style?: CSSProperties;
  className?: string;
}

/** One chat message: a list item, for an `<ol>` of chat. */
function ChatMessage({
  message,
  density = "comfortable",
  timestamps = "always",
  highlight = IDLE,
  removal,
  flag,
  suggested = false,
  spotlight = false,
  mentionNames = NO_NAMES,
  onHighlight,
  onReply,
  onCopy,
  onRemoveFromChat,
  removeFromChatReason = null,
  tabIndex = 0,
  ref,
  style,
  className,
}: ChatMessageProps): ReactElement {
  const highlightable =
    Boolean(onHighlight) && chatMessageCanHighlight(message);
  // A suggestion only where tapping the row can act on it, and never once
  // the message is on (or on its way to) the stream.
  const showSuggested =
    suggested && highlightable && highlight.phase === "idle";
  const mentioned = chatMessageMentions(message, mentionNames);
  const onStream = highlight.phase === "live";
  const tint = chatMessageTint(message, { onStream, spotlight });
  const rowId = useId();
  const nameIds = {
    author: `${rowId}-author`,
    platform: `${rowId}-platform`,
    text: `${rowId}-text`,
  };
  const content = (
    <ChatMessageContent
      density={density}
      flag={flag}
      highlight={highlight}
      mentioned={mentioned}
      message={message}
      nameIds={highlightable ? nameIds : undefined}
      removal={removal}
      spotlight={spotlight && !flag}
      suggested={showSuggested}
      timestamps={timestamps}
    />
  );
  const menu = chatMessageMenu(message, {
    highlightPhase: highlight.phase,
    highlightable,
    onCopy,
    onHighlight,
    onRemoveFromChat,
    onReply,
    removeFromChatReason,
  });
  return (
    <li
      className={cn(
        "group/chat-message group/kebab-host flex items-start gap-0.5",
        !highlightable &&
          "rounded-row focus-visible:ring-ring/50 outline-none focus-visible:ring-2",
        className
      )}
      data-highlight-phase={highlight.phase}
      data-member={tint === "member" || undefined}
      data-mention={mentioned || undefined}
      data-message-id={message.id}
      data-row-tint={tint ?? undefined}
      data-slot="chat-message"
      ref={ref}
      style={style}
      // A row with no button of its own still takes the list's focus.
      tabIndex={highlightable ? undefined : tabIndex}
    >
      {highlightable ? (
        // One button: a click shows the message on stream or takes it off.
        // Its name is what the row says (author, platform, message), so a
        // screen reader reads the chat; aria-pressed says on stream.
        <Button
          // A global attribute since ARIA 1.3, and Chromium reads it; the
          // lint's role table predates it.
          // oxlint-disable-next-line jsx-a11y/role-supports-aria-props -- see above.
          aria-description={rowDescription(highlight, removal, showSuggested)}
          aria-labelledby={`${nameIds.author} ${nameIds.platform} ${nameIds.text}`}
          aria-pressed={onStream}
          // oxlint-disable-next-line shadcn/require-static-classes -- The row's one surface, from rowSurfaceClass.
          className={cn(ROW_BUTTON_CLASS, rowSurfaceClass(tint, onStream))}
          disabled={highlight.phase === "applying"}
          onClick={(event) => {
            // A drag that ends with words selected in this row is a copy,
            // never a show. A keyboard click (detail 0) never carries a drag.
            const selection = window.getSelection();
            if (
              event.detail > 0 &&
              selection &&
              !selection.isCollapsed &&
              event.currentTarget.contains(selection.anchorNode)
            ) {
              return;
            }
            onHighlight?.(message);
          }}
          tabIndex={tabIndex}
          type="button"
          variant="ghost"
        >
          {content}
        </Button>
      ) : (
        <div
          className={cn(
            "rounded-row flex min-w-0 flex-1 items-start gap-2 px-2 py-1.5",
            rowSurfaceClass(tint, onStream)
          )}
        >
          {content}
        </div>
      )}
      <KebabMenu
        className="mt-1 shrink-0"
        items={menu}
        label={`Actions for ${message.authorName}'s message`}
        reveal="hover"
        tabIndex={tabIndex}
      />
    </li>
  );
}

export {
  ChatMessage,
  HighlightStatus,
  RemovalStatus,
  REMOVE_FROM_CHAT_LABEL,
  chatMessageCanHighlight,
  chatMessageInitials,
  chatMessageMentions,
  chatMessageMenu,
  formatChatTime,
  type ChatAuthorRole,
  type ChatMessageData,
  type ChatMessageDensity,
  type ChatMessageFlag,
  type ChatMessageHighlight,
  type ChatMessageHighlightPhase,
  type ChatMessageKind,
  type ChatMessageProps,
  type ChatMessageRemoval,
  type ChatMessageRemovalKind,
  type ChatMessageTimestamps,
};
