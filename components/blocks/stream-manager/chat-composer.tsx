"use client";

import { useRef, useState } from "react";
import type { KeyboardEvent, ReactElement, ReactNode, RefObject } from "react";

import {
  CHAT_PLATFORM_LABELS,
  ChatPlatformIcon,
  chatStateLabel,
} from "@/components/blocks/stream-manager/chat-platform";
import type {
  ChatDestination,
  ChatPlatform,
} from "@/components/blocks/stream-manager/chat-platform";
import { AlertIcon, ChevronDownIcon, SendIcon } from "@/components/icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Command, CommandItem, CommandList } from "@/components/ui/command";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { ShortcutKeys } from "@/components/ui/shortcut-keys";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

// The Stream Manager's composer: a flush region under a hairline, never a
// card. The "To:" picker names where a message goes, so the line under the
// field speaks only for the exceptions: a destination the send skips, a
// failed send's reason, a send in flight. A finished send says nothing; the
// message shows up in chat.

/** Where one send goes: every writable destination when absent. */
interface ChatSendOptions {
  destinationIds?: string[];
}

/** One destination a send didn't reach, and why. */
interface ChatSendFailure {
  destinationId: string;
  platform: ChatPlatform;
  reason: string;
}

/** A local command the composer completes: "/marker". */
interface ChatComposerCommand {
  value: string;
  /** What follows it in the list: " [title] · Save a timeline point". */
  hint: string;
  /** It takes an argument: completing it leaves a space for one. */
  argument?: boolean;
}

/** Most platforms take 200 characters; X broadcast chat takes 140. */
const CHAT_SEND_MAX_CHARS = 200;
const PLATFORM_MAX_CHARS: Partial<Record<ChatPlatform, number>> = { x: 140 };

/** A draft must fit the strictest destination it reaches. */
function chatDraftMaxChars(platforms: readonly ChatPlatform[]): number {
  return Math.min(
    CHAT_SEND_MAX_CHARS,
    ...platforms.map(
      (platform) => PLATFORM_MAX_CHARS[platform] ?? CHAT_SEND_MAX_CHARS
    )
  );
}

/**
 * What the composer says about its destinations: only the exceptions. A
 * destination the send reaches needs no words; the rest say why not ("X
 * read-only", "Twitch reconnect to send").
 */
function chatDestinationNotes(
  destinations: readonly ChatDestination[],
  sendPlatforms: readonly ChatPlatform[]
): string {
  const parts = sendPlatforms.length > 0 ? [] : ["No writable destinations"];
  const described = new Set<ChatPlatform>();
  for (const destination of destinations) {
    if (
      described.has(destination.platform) ||
      sendPlatforms.includes(destination.platform)
    ) {
      continue;
    }
    described.add(destination.platform);
    const label = CHAT_PLATFORM_LABELS[destination.platform];
    if (destination.write === "missing-scope") {
      parts.push(`${label} reconnect to send`);
    } else if (destination.write === "failed") {
      parts.push(`${label} send failed`);
    } else if (destination.state === "connected") {
      parts.push(`${label} read-only`);
    } else if (destination.state === "failed") {
      parts.push(`${label} failed`);
    } else if (
      destination.state === "connecting" ||
      destination.state === "reconnecting"
    ) {
      parts.push(`${label} ${chatStateLabel(destination).toLowerCase()}`);
    }
  }
  return parts.join(" · ");
}

/** The two literal slashes that send one slash to chat: "//shrug". */
const LITERAL_SLASH = "//";

interface ChatComposerProps {
  /** Chat's destinations: the writable ones are the picker's choices. */
  destinations: readonly ChatDestination[];
  /** Sends a message to every writable destination, or to the picked ones. */
  onSend: (text: string, options: ChatSendOptions) => void;
  /** Local commands to complete after "/". A command never posts to chat. */
  commands?: readonly ChatComposerCommand[];
  /** Runs a local command instead of sending it. */
  onCommand?: (text: string) => void;
  /** A send is on its way: "Sending…". */
  pending?: boolean;
  /** Where the last send failed: one chip each. */
  failures?: readonly ChatSendFailure[];
  /** Re-sends where the last send failed. */
  onRetry?: () => void;
  /** The composer's own answer: "Marker saved at 30:44 · Untitled marker". */
  notice?: ReactNode;
  /** The draft, when the window owns it (a ⋯ Reply prefills it). */
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  /** The field, for ⌘L to focus. */
  inputRef?: RefObject<HTMLInputElement | null>;
  /** `darwin`, `win32`, `linux`…: how ↵ is printed. */
  platform?: string;
  className?: string;
}

const NO_FAILURES: readonly ChatSendFailure[] = [];

/** The "To:" picker: every writable destination, or the streamer's pick. */
function SendToPicker({
  writable,
  picked,
  pickLabel,
  onPick,
  onPickAll,
}: {
  writable: readonly ChatDestination[];
  picked: ReadonlySet<string> | null;
  pickLabel: string;
  onPick: (id: string, checked: boolean) => void;
  onPickAll: () => void;
}): ReactElement {
  return (
    <InputGroupAddon>
      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label={`Send to: ${pickLabel}`}
          render={<InputGroupButton size="xs" />}
        >
          To: {pickLabel}
          <ChevronDownIcon data-icon="inline-end" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          <DropdownMenuGroup>
            <DropdownMenuLabel>Send to</DropdownMenuLabel>
            {writable.map((destination) => (
              <DropdownMenuCheckboxItem
                checked={picked === null || picked.has(destination.id)}
                closeOnClick={false}
                key={destination.id}
                onCheckedChange={(checked) => onPick(destination.id, checked)}
              >
                <ChatPlatformIcon decorative platform={destination.platform} />
                {CHAT_PLATFORM_LABELS[destination.platform]}
                {destination.accountLabel ? (
                  <span className="text-muted-foreground truncate">
                    {destination.accountLabel}
                  </span>
                ) : null}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={onPickAll}>
            Every writable destination
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </InputGroupAddon>
  );
}

/** The count while there is a draft; over the limit, the icon carries the tone. */
function DraftCount({
  length,
  maxChars,
  local,
}: {
  length: number;
  maxChars: number;
  local: boolean;
}): ReactElement {
  const overLimit = !local && length > maxChars;
  return (
    <span
      className={cn(
        "text-label flex items-center gap-1 tabular-nums",
        overLimit
          ? "text-foreground font-medium"
          : "text-muted-foreground font-normal"
      )}
      data-slot="chat-composer-count"
    >
      {overLimit ? (
        <AlertIcon
          aria-hidden
          className="text-destructive size-3"
          weight="fill"
        />
      ) : null}
      {local ? "Local" : `${length}/${maxChars}`}
    </span>
  );
}

/** Only the exceptions: what a send skips, where it failed, a send in flight. */
function ComposerStatus({
  notes,
  failures,
  onRetry,
  pending,
  lastSent,
}: {
  notes: string;
  failures: readonly ChatSendFailure[];
  onRetry?: () => void;
  pending: boolean;
  lastSent: string | null;
}): ReactElement {
  const sending = <Badge>Sending…</Badge>;
  return (
    <div
      className="mt-1.5 flex min-w-0 flex-col gap-1.5 empty:hidden"
      data-slot="chat-composer-status"
    >
      {notes ? (
        <p className="text-label text-muted-foreground min-w-0 truncate leading-tight font-normal">
          {notes}
        </p>
      ) : null}
      {failures.length > 0 ? (
        <div className="flex flex-wrap gap-1">
          {failures.map((failure) => (
            <Badge
              key={`${failure.destinationId}:${failure.reason}`}
              variant="destructive"
            >
              {/* A Badge sets 12 px icons: YouTube's mark may not shrink, so
                  its chip names it in words only. */}
              {failure.platform === "youtube" ? null : (
                <ChatPlatformIcon decorative platform={failure.platform} />
              )}
              {CHAT_PLATFORM_LABELS[failure.platform]}: {failure.reason}
            </Badge>
          ))}
        </div>
      ) : null}
      {failures.length > 0 && onRetry && !pending ? (
        <Button
          aria-label="Retry where the send failed"
          className="w-fit"
          onClick={onRetry}
          size="xs"
          type="button"
          variant="outline"
        >
          Retry
        </Button>
      ) : null}
      {pending ? (
        // A send in flight says so; a finished one says nothing.
        <div aria-label="Latest message delivery" className="flex">
          {lastSent ? (
            <Tooltip>
              <TooltipTrigger render={sending} />
              <TooltipContent>{lastSent}</TooltipContent>
            </Tooltip>
          ) : (
            sending
          )}
        </div>
      ) : null}
    </div>
  );
}

/** The local commands that match the draft, while it is one word after "/". */
function matchingCommands(
  commands: readonly ChatComposerCommand[] | undefined,
  draft: string
): readonly ChatComposerCommand[] {
  if (!commands || !draft.startsWith("/") || draft.includes(" ")) {
    return [];
  }
  return commands.filter((command) =>
    command.value.startsWith(draft.toLowerCase())
  );
}

function sendButtonLabel({
  local,
  pending,
  targets,
  allPicked,
  pickLabel,
}: {
  local: boolean;
  pending: boolean;
  targets: number;
  allPicked: boolean;
  pickLabel: string;
}): string {
  if (local) {
    return "Run local command";
  }
  if (pending) {
    return "Sending message";
  }
  if (targets === 0) {
    return "Send message: no destination picked";
  }
  return allPicked
    ? "Send message to all writable destinations"
    : `Send message to ${pickLabel}`;
}

/** The writable destinations, the streamer's pick among them, and its name. */
function useSendTargets(destinations: readonly ChatDestination[]) {
  // null sends to every writable destination; a set is the streamer's pick.
  const [picked, setPicked] = useState<ReadonlySet<string> | null>(null);
  const writable = destinations.filter(
    (destination) => destination.write === "ready"
  );
  // A pick that has since gone read-only never silently widens to all.
  const targets = picked
    ? writable.filter((destination) => picked.has(destination.id))
    : writable;
  const targetPlatforms = [
    ...new Set(targets.map((destination) => destination.platform)),
  ];
  const allPicked = picked === null || targets.length === writable.length;
  const pickNames = targetPlatforms
    .map((target) => CHAT_PLATFORM_LABELS[target])
    .join(", ");
  const pick = (id: string, checked: boolean): void => {
    setPicked((current) => {
      const next = new Set(
        current ?? writable.map((destination) => destination.id)
      );
      if (checked) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next.size === writable.length ? null : next;
    });
  };
  return {
    allPicked,
    pick,
    pickAll: () => setPicked(null),
    pickLabel: allPicked ? "All" : pickNames || "None",
    picked,
    targetPlatforms,
    targets,
    writable,
  };
}

/**
 * The field's keys: ↑ and ↓ move through the completions, Tab or ↵ completes
 * the chosen one, Esc closes them, and ↵ sends. Never mid-composition.
 */
function handleComposerKey(
  event: KeyboardEvent<HTMLInputElement>,
  {
    completions,
    selected,
    draft,
    move,
    complete,
    dismiss,
    submit,
  }: {
    completions: readonly ChatComposerCommand[];
    selected: ChatComposerCommand | undefined;
    draft: string;
    move: (step: number) => void;
    complete: (command: ChatComposerCommand) => void;
    dismiss: () => void;
    submit: () => void;
  }
): void {
  if (event.nativeEvent.isComposing) {
    return;
  }
  if (event.key === "Escape") {
    dismiss();
    return;
  }
  const open = completions.length > 0;
  if (open && (event.key === "ArrowDown" || event.key === "ArrowUp")) {
    event.preventDefault();
    move(event.key === "ArrowDown" ? 1 : -1);
    return;
  }
  const completing =
    event.key === "Tab" ||
    (event.key === "Enter" && draft.trim().toLowerCase() !== selected?.value);
  if (open && selected && completing) {
    event.preventDefault();
    complete(selected);
    return;
  }
  if (event.key === "Enter") {
    event.preventDefault();
    submit();
  }
}

/** What the draft is: a local command or a message, its words, and whether ↵ can act. */
function readDraft(
  draft: string,
  {
    commands,
    pending,
    targets,
    maxChars,
  }: { commands: boolean; pending: boolean; targets: number; maxChars: number }
): { local: boolean; text: string; canSend: boolean } {
  const literal = draft.startsWith(LITERAL_SLASH);
  const local = commands && draft.startsWith("/") && !literal;
  const text = (literal ? draft.slice(1) : draft).trim();
  if (local) {
    return { canSend: text.length > 1, local, text };
  }
  const fits = text.length > 0 && text.length <= maxChars;
  return { canSend: targets > 0 && !pending && fits, local, text };
}

/** The local commands matching the draft, under the field. */
function CommandCompletions({
  completions,
  selected,
  onComplete,
}: {
  completions: readonly ChatComposerCommand[];
  selected: ChatComposerCommand | undefined;
  onComplete: (command: ChatComposerCommand) => void;
}): ReactElement {
  return (
    <Command
      aria-label="Local commands"
      className="mt-1"
      shouldFilter={false}
      value={selected?.value}
    >
      <CommandList>
        {completions.map((command) => (
          <CommandItem
            key={command.value}
            onSelect={() => onComplete(command)}
            value={command.value}
          >
            {command.value}
            {command.hint}
          </CommandItem>
        ))}
      </CommandList>
    </Command>
  );
}

/** The draft, owned here or by the window. */
function useDraft(
  value: string | undefined,
  defaultValue: string,
  onValueChange: ((value: string) => void) | undefined
): [string, (next: string) => void] {
  const [ownDraft, setOwnDraft] = useState(defaultValue);
  const setDraft = (next: string): void => {
    if (value === undefined) {
      setOwnDraft(next);
    }
    onValueChange?.(next);
  };
  return [value ?? ownDraft, setDraft];
}

/**
 * The composer: the "To:" picker, the field, the count, ↵ and send, then the
 * line for the exceptions. Local commands complete after "/" and run
 * through `onCommand`, never posting to chat; "//" sends one literal slash.
 */
function ChatComposer({
  destinations,
  onSend,
  commands,
  onCommand,
  pending = false,
  failures = NO_FAILURES,
  onRetry,
  notice,
  value,
  defaultValue = "",
  onValueChange,
  placeholder = "Send a message…",
  inputRef,
  platform,
  className,
}: ChatComposerProps): ReactElement {
  const [draft, setDraft] = useDraft(value, defaultValue, onValueChange);
  const ownRef = useRef<HTMLInputElement>(null);
  const fieldRef = inputRef ?? ownRef;
  const [completionDismissed, setCompletionDismissed] = useState(false);
  const [completionIndex, setCompletionIndex] = useState(0);
  const [lastSent, setLastSent] = useState<string | null>(null);

  const {
    allPicked,
    pick,
    pickAll,
    pickLabel,
    picked,
    targetPlatforms,
    targets,
    writable,
  } = useSendTargets(destinations);
  const maxChars = chatDraftMaxChars(targetPlatforms);
  const { canSend, local, text } = readDraft(draft, {
    commands: Boolean(commands),
    maxChars,
    pending,
    targets: targets.length,
  });

  const completions = matchingCommands(commands, draft);
  const showCompletions = completions.length > 0 && !completionDismissed;
  const selected = completions[completionIndex] ?? completions[0];

  const complete = (command: ChatComposerCommand): void => {
    setDraft(command.value + (command.argument ? " " : ""));
    setCompletionDismissed(true);
    setCompletionIndex(0);
    fieldRef.current?.focus();
  };

  const submit = (): void => {
    if (!canSend) {
      return;
    }
    if (local) {
      onCommand?.(text);
    } else {
      onSend(
        text,
        picked
          ? { destinationIds: targets.map((destination) => destination.id) }
          : {}
      );
      setLastSent(text);
    }
    setDraft("");
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>): void =>
    handleComposerKey(event, {
      complete,
      completions: showCompletions ? completions : [],
      dismiss: () => setCompletionDismissed(true),
      draft,
      move: (step) =>
        setCompletionIndex(
          (index) => (index + step + completions.length) % completions.length
        ),
      selected,
      submit,
    });

  return (
    // A flush region under a hairline: no box, no card inside.
    <div
      className={cn("border-border shrink-0 border-t px-2 py-2", className)}
      data-slot="chat-composer"
    >
      <div className="flex flex-col">
        <InputGroup>
          {local ? (
            <InputGroupAddon>
              <span className="text-label text-muted-foreground font-normal">
                Local
              </span>
            </InputGroupAddon>
          ) : null}
          {!local && writable.length > 1 ? (
            <SendToPicker
              onPick={pick}
              onPickAll={pickAll}
              pickLabel={pickLabel}
              picked={picked}
              writable={writable}
            />
          ) : null}
          <InputGroupInput
            aria-label={commands ? "Message or local command" : "Message"}
            onChange={(event) => {
              setDraft(event.target.value);
              setCompletionDismissed(false);
              setCompletionIndex(0);
            }}
            onKeyDown={onKeyDown}
            placeholder={placeholder}
            ref={fieldRef}
            value={draft}
          />
          <InputGroupAddon align="inline-end">
            {draft.length > 0 ? (
              <DraftCount
                length={text.length}
                local={local}
                maxChars={maxChars}
              />
            ) : null}
            <ShortcutKeys accelerator="Enter" platform={platform} />
            <InputGroupButton
              aria-label={sendButtonLabel({
                allPicked,
                local,
                pending,
                pickLabel,
                targets: targets.length,
              })}
              disabled={!canSend}
              onClick={submit}
              size="icon-xs"
            >
              <SendIcon data-icon="inline-end" weight="fill" />
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
        {showCompletions ? (
          <CommandCompletions
            completions={completions}
            onComplete={complete}
            selected={selected}
          />
        ) : null}
        {notice ? (
          <div className="text-muted-foreground mt-1 text-xs" role="status">
            {notice}
          </div>
        ) : null}
        <ComposerStatus
          failures={failures}
          lastSent={lastSent}
          notes={chatDestinationNotes(destinations, targetPlatforms)}
          onRetry={onRetry}
          pending={pending}
        />
      </div>
    </div>
  );
}

export {
  ChatComposer,
  chatDestinationNotes,
  chatDraftMaxChars,
  type ChatComposerCommand,
  type ChatComposerProps,
  type ChatSendFailure,
  type ChatSendOptions,
};
