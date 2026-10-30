"use client";

import type { ReactElement, Ref } from "react";

import { chatMessageMentions } from "@/components/blocks/stream-manager/chat-message";
import type { ChatMessageData } from "@/components/blocks/stream-manager/chat-message";
import type { ChatPlatform } from "@/components/blocks/stream-manager/chat-platform";
import {
  PlatformFilter,
  PlatformFilterMenuItems,
} from "@/components/blocks/stream-manager/platform-filter";
import type { PlatformFilterValue } from "@/components/blocks/stream-manager/platform-filter";
import { ChevronDownIcon, SearchIcon } from "@/components/icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { ShortcutKeys } from "@/components/ui/shortcut-keys";
import { ShortcutTooltip } from "@/components/ui/shortcut-tooltip";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";

// The chat pane's filter strip: platform chips, Buddy's questions, mentions
// of the streamer, and search with its key. From 640 px the filters are
// inline chips; below it, inside the Stream Manager's container, they fold
// into one Filters menu. Outside the Stream Manager the chips always show.

/** Shown below 640 px of Stream Manager only. */
const NARROW_ONLY = "hidden @max-[639px]/stream-manager:flex";
/** Hidden below 640 px of Stream Manager. */
const ABOVE_NARROW = "@max-[639px]/stream-manager:hidden";

// Videorc's chips: the 28 px toggle with 12 px words. The Filters button
// below 640 px is the ghost button at the same height, tightened.
// oxlint-disable-next-line shadcn/no-restyle -- see above.
const WORD_CHIP_CLASS = "text-xs";
const FILTERS_BUTTON_CLASS =
  // oxlint-disable-next-line shadcn/no-restyle -- see above.
  "shrink-0 gap-1 px-2 text-xs";

/** What chat shows: one platform or all, Buddy's questions, mentions, and a search. */
interface ChatFilter {
  platform: PlatformFilterValue;
  questions: boolean;
  mentions: boolean;
  search: string;
}

const DEFAULT_CHAT_FILTER: ChatFilter = Object.freeze({
  mentions: false,
  platform: "all",
  questions: false,
  search: "",
});

/** Whether a filter or a search narrows chat. */
function chatFilterActive(filter: ChatFilter): boolean {
  return (
    filter.platform !== "all" ||
    filter.questions ||
    filter.mentions ||
    filter.search.trim() !== ""
  );
}

/**
 * The messages a filter shows: one platform, the ones behind Buddy's open
 * questions, the ones that mention the streamer, and a search through words
 * and names.
 */
function filterChatMessages<T extends ChatMessageData>(
  messages: readonly T[],
  filter: ChatFilter,
  {
    questionIds,
    mentionNames,
  }: {
    questionIds?: ReadonlySet<string>;
    mentionNames?: readonly string[];
  } = {}
): T[] {
  const query = filter.search.trim().toLowerCase();
  return messages.filter((message) => {
    if (filter.platform !== "all" && message.platform !== filter.platform) {
      return false;
    }
    if (filter.questions && !questionIds?.has(message.id)) {
      return false;
    }
    if (filter.mentions && !chatMessageMentions(message, mentionNames ?? [])) {
      return false;
    }
    return (
      !query ||
      message.text.toLowerCase().includes(query) ||
      message.authorName.toLowerCase().includes(query)
    );
  });
}

interface ChatToolbarProps {
  /** The platforms chat comes from: a chip each, from two up. */
  platforms: readonly ChatPlatform[];
  filter: ChatFilter;
  onFilterChange: (filter: ChatFilter) => void;
  /** Buddy has open questions: the Questions chip shows (and stays while it's on). */
  questions?: boolean;
  /** The search field, for ⌘F to focus. */
  searchRef?: Ref<HTMLInputElement>;
  /** `darwin`, `win32`, `linux`…: how ⌘F is printed. */
  platform?: string;
  className?: string;
}

/** Chat's filters and search, flush under a hairline. */
function ChatToolbar({
  platforms,
  filter,
  onFilterChange,
  questions = false,
  searchRef,
  platform,
  className,
}: ChatToolbarProps): ReactElement {
  const change = (patch: Partial<ChatFilter>): void =>
    onFilterChange({ ...filter, ...patch });
  const showQuestions = questions || filter.questions;
  const activeCount =
    Number(filter.platform !== "all") +
    Number(filter.questions) +
    Number(filter.mentions);
  const chips = [
    ...(filter.questions ? ["questions"] : []),
    ...(filter.mentions ? ["mentions"] : []),
  ];
  return (
    <div
      className={cn(
        "border-border flex shrink-0 flex-wrap items-center gap-1.5 border-b px-2 py-1.5",
        className
      )}
      data-slot="chat-toolbar"
    >
      <div className={cn("flex flex-wrap items-center gap-1.5", ABOVE_NARROW)}>
        <PlatformFilter
          label="Show chat from"
          onValueChange={(next) => change({ platform: next })}
          platforms={platforms}
          value={filter.platform}
        />
        <ToggleGroup
          aria-label="Chat filters"
          multiple
          onValueChange={(values) =>
            change({
              mentions: values.includes("mentions"),
              questions: values.includes("questions"),
            })
          }
          value={chips}
        >
          {showQuestions ? (
            <ShortcutTooltip label="Messages behind Buddy's open questions">
              <ToggleGroupItem className={WORD_CHIP_CLASS} value="questions">
                Questions
              </ToggleGroupItem>
            </ShortcutTooltip>
          ) : null}
          <ShortcutTooltip label="Messages that @mention your channel">
            <ToggleGroupItem className={WORD_CHIP_CLASS} value="mentions">
              Mentions
            </ToggleGroupItem>
          </ShortcutTooltip>
        </ToggleGroup>
      </div>
      {/* Below 640 px the same filters live in one menu. */}
      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label="Chat filters"
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
          {platforms.length > 1 ? (
            <>
              <PlatformFilterMenuItems
                label="Show chat from"
                onValueChange={(next) => change({ platform: next })}
                platforms={platforms}
                value={filter.platform}
              />
              <DropdownMenuSeparator />
            </>
          ) : null}
          <DropdownMenuGroup>
            {showQuestions ? (
              <DropdownMenuCheckboxItem
                checked={filter.questions}
                onCheckedChange={(checked) => change({ questions: checked })}
              >
                Questions
              </DropdownMenuCheckboxItem>
            ) : null}
            <DropdownMenuCheckboxItem
              checked={filter.mentions}
              onCheckedChange={(checked) => change({ mentions: checked })}
            >
              Mentions
            </DropdownMenuCheckboxItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      <InputGroup className="min-w-28 flex-1 basis-40">
        <InputGroupAddon>
          <SearchIcon />
        </InputGroupAddon>
        <InputGroupInput
          aria-label="Search chat"
          onChange={(event) => change({ search: event.target.value })}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              change({ search: "" });
              event.currentTarget.blur();
            }
          }}
          placeholder="Search chat…"
          ref={searchRef}
          value={filter.search}
        />
        <InputGroupAddon align="inline-end">
          <ShortcutKeys accelerator="CmdOrCtrl+F" platform={platform} />
        </InputGroupAddon>
      </InputGroup>
    </div>
  );
}

export {
  ChatToolbar,
  DEFAULT_CHAT_FILTER,
  chatFilterActive,
  filterChatMessages,
  type ChatFilter,
  type ChatToolbarProps,
};
