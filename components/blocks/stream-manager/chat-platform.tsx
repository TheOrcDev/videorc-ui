import type { ReactElement } from "react";

import {
  FacebookIcon,
  InstagramIcon,
  LivestreamIcon,
  TiktokIcon,
  TwitchIcon,
  XPlatformIcon,
  YoutubeIcon,
} from "@/components/icons";
import type { AppIcon } from "@/components/icons";
import { cn } from "@/lib/utils";

// The Stream Manager's platform vocabulary: one name per platform, its mark
// in its brand tint, and a destination's chat state in words. Source and
// platform marks are the one place saturated colour is allowed, and the
// tints match the Livestream page's destination tiles so a platform reads
// the same everywhere.

/** A platform chat can come from. */
type ChatPlatform =
  | "youtube"
  | "twitch"
  | "x"
  | "facebook"
  | "tiktok"
  | "instagram"
  | "custom";

/** One name per platform: "X", never "X / Twitter"; "Custom RTMP", never "Custom". */
const CHAT_PLATFORM_LABELS: Readonly<Record<ChatPlatform, string>> = {
  custom: "Custom RTMP",
  facebook: "Facebook",
  instagram: "Instagram",
  tiktok: "TikTok",
  twitch: "Twitch",
  x: "X",
  youtube: "YouTube",
};

const CHAT_PLATFORM_ICON: Readonly<Record<ChatPlatform, AppIcon>> = {
  custom: LivestreamIcon,
  facebook: FacebookIcon,
  instagram: InstagramIcon,
  tiktok: TiktokIcon,
  twitch: TwitchIcon,
  x: XPlatformIcon,
  youtube: YoutubeIcon,
};

/**
 * The brand tints. YouTube keeps clear space of at least its triangle's
 * width (about 7 px at 20 px) before the text that follows it, on top of
 * the row's own gap. X's mark is pure black or white by theme.
 */
const CHAT_PLATFORM_TINT: Readonly<Record<ChatPlatform, string>> = {
  custom: "text-muted-foreground",
  facebook: "text-platform-facebook",
  instagram: "text-platform-instagram",
  tiktok: "text-foreground",
  twitch: "text-platform-twitch-ink",
  x: "text-foreground",
  youtube: "text-platform-youtube mr-1",
};

interface ChatPlatformIconProps {
  platform: ChatPlatform;
  /** Hidden from assistive tech when the words beside it already name the platform. */
  decorative?: boolean;
  className?: string;
}

/**
 * A platform's mark, 20 px at every use: YouTube's icon may not go below
 * 20 px, so every other platform matches it. A surface with no room for
 * 20 px (a Badge) leaves the mark out and keeps the platform's name.
 */
function ChatPlatformIcon({
  platform,
  decorative = false,
  className,
}: ChatPlatformIconProps): ReactElement {
  const Glyph = CHAT_PLATFORM_ICON[platform];
  return (
    <Glyph
      aria-hidden={decorative || undefined}
      aria-label={decorative ? undefined : CHAT_PLATFORM_LABELS[platform]}
      className={cn("size-5 shrink-0", CHAT_PLATFORM_TINT[platform], className)}
      data-platform={platform}
      data-slot="chat-platform-icon"
      role={decorative ? undefined : "img"}
      weight="fill"
    />
  );
}

/** A destination's chat connection. */
type ChatDestinationState =
  | "connected"
  | "connecting"
  | "reconnecting"
  | "waiting"
  | "paused"
  | "failed"
  | "ended"
  | "off"
  | "unavailable";

/** Whether Videorc can send to it: `ready` sends, the rest read only. */
type ChatDestinationWrite = "ready" | "read-only" | "missing-scope" | "failed";

/** One destination's chat, as the Stream Manager reads it. */
interface ChatDestination {
  id: string;
  platform: ChatPlatform;
  state: ChatDestinationState;
  /** Absent reads as `read-only`. */
  write?: ChatDestinationWrite;
  /** The account chat is read as: "@nightowlstudio". */
  accountLabel?: string;
  /** The destination's own words when chat is stuck: "Paused until 9:00 PM…". */
  message?: string;
}

/**
 * A destination's chat state, in the one vocabulary every window shares:
 * "Connected", "Read-only", "Reconnect to send", "Reconnecting…". Never
 * "receive-only" and never a raw value.
 */
function chatStateLabel(destination: ChatDestination): string {
  switch (destination.state) {
    case "failed": {
      return "Failed";
    }
    case "ended": {
      return "Ended";
    }
    case "off": {
      return "Off";
    }
    case "unavailable": {
      return "Unavailable";
    }
    case "connecting": {
      return "Connecting…";
    }
    case "reconnecting": {
      return "Reconnecting…";
    }
    case "paused": {
      return "Paused";
    }
    case "waiting": {
      return "Waiting…";
    }
    default: {
      break;
    }
  }
  switch (destination.write) {
    case "ready": {
      return "Connected";
    }
    case "missing-scope": {
      return "Reconnect to send";
    }
    case "failed": {
      return "Send failed";
    }
    default: {
      return "Read-only";
    }
  }
}

export {
  ChatPlatformIcon,
  CHAT_PLATFORM_LABELS,
  chatStateLabel,
  type ChatDestination,
  type ChatDestinationState,
  type ChatDestinationWrite,
  type ChatPlatform,
  type ChatPlatformIconProps,
};
