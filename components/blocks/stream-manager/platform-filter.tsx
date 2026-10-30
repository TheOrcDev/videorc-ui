"use client";

import type { ReactElement } from "react";

import {
  CHAT_PLATFORM_LABELS,
  ChatPlatformIcon,
} from "@/components/blocks/stream-manager/chat-platform";
import type { ChatPlatform } from "@/components/blocks/stream-manager/chat-platform";
import {
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import { ShortcutTooltip } from "@/components/ui/shortcut-tooltip";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

// The one platform filter for Chat and Activity: an All chip and one icon
// chip per platform from 640 px, and the same choice as a radio group inside
// each pane's Filters menu below it. Nothing at all with one platform: there
// is nothing to filter by.

type PlatformFilterValue = ChatPlatform | "all";

// Videorc's filter chips: the 28 px toggle with 12 px words, level with the
// 20 px platform marks beside them.
// oxlint-disable-next-line shadcn/no-restyle -- see above.
const WORD_CHIP_CLASS = "text-xs";

interface PlatformFilterProps {
  platforms: readonly ChatPlatform[];
  value: PlatformFilterValue;
  onValueChange: (value: PlatformFilterValue) => void;
  /** The group's accessible name: "Show chat from", "Show activity from". */
  label: string;
}

/** The chips: All, then one icon per platform. A chip clicked again turns back to All. */
function PlatformFilter({
  platforms,
  value,
  onValueChange,
  label,
}: PlatformFilterProps): ReactElement | null {
  if (platforms.length < 2) {
    return null;
  }
  return (
    <ToggleGroup
      aria-label={label}
      data-slot="platform-filter"
      onValueChange={(next) =>
        onValueChange((next[0] as PlatformFilterValue | undefined) ?? "all")
      }
      value={[value]}
    >
      <ToggleGroupItem className={WORD_CHIP_CLASS} value="all">
        All
      </ToggleGroupItem>
      {platforms.map((platform) => (
        <ShortcutTooltip
          key={platform}
          label={`Only ${CHAT_PLATFORM_LABELS[platform]}`}
        >
          <ToggleGroupItem
            aria-label={CHAT_PLATFORM_LABELS[platform]}
            value={platform}
          >
            <ChatPlatformIcon decorative platform={platform} />
          </ToggleGroupItem>
        </ShortcutTooltip>
      ))}
    </ToggleGroup>
  );
}

/** The same choice inside a Filters menu, below 640 px. Nothing with one platform. */
function PlatformFilterMenuItems({
  platforms,
  value,
  onValueChange,
  label,
}: PlatformFilterProps): ReactElement | null {
  if (platforms.length < 2) {
    return null;
  }
  return (
    <>
      <DropdownMenuLabel>{label}</DropdownMenuLabel>
      <DropdownMenuRadioGroup
        onValueChange={(next) => onValueChange(next as PlatformFilterValue)}
        value={value}
      >
        <DropdownMenuRadioItem value="all">
          Every platform
        </DropdownMenuRadioItem>
        {platforms.map((platform) => (
          <DropdownMenuRadioItem key={platform} value={platform}>
            <ChatPlatformIcon decorative platform={platform} />
            {CHAT_PLATFORM_LABELS[platform]}
          </DropdownMenuRadioItem>
        ))}
      </DropdownMenuRadioGroup>
    </>
  );
}

export {
  PlatformFilter,
  PlatformFilterMenuItems,
  type PlatformFilterProps,
  type PlatformFilterValue,
};
