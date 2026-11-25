import type { ReactElement } from "react";

import {
  type AppIcon,
  FacebookIcon,
  InstagramIcon,
  KickIcon,
  LivestreamIcon,
  TiktokIcon,
  TwitchIcon,
  YoutubeIcon,
} from "@/components/icons";
import { cn } from "@/lib/utils";

type StreamPlatform =
  | "youtube"
  | "twitch"
  | "x"
  | "facebook"
  | "tiktok"
  | "instagram"
  | "kick"
  | "custom";

type TiledPlatform = Exclude<StreamPlatform, "youtube" | "x">;

const PLATFORM_ICON: Record<TiledPlatform, AppIcon> = {
  twitch: TwitchIcon,
  kick: KickIcon,
  facebook: FacebookIcon,
  tiktok: TiktokIcon,
  instagram: InstagramIcon,
  custom: LivestreamIcon,
};

const PLATFORM_GLYPH_TINT: Record<TiledPlatform, string> = {
  twitch: "bg-platform-twitch/15 text-platform-twitch-ink",
  kick: "bg-platform-kick text-platform-kick-ink",
  facebook: "bg-platform-facebook/15 text-platform-facebook",
  tiktok: "bg-foreground/10 text-foreground",
  instagram: "bg-platform-instagram/15 text-platform-instagram",
  custom: "bg-foreground/10 text-muted-foreground",
};

const X_LOCKUP = {
  light: "/brand/x/x-logo-lockup-black-on-white.svg",
  dark: "/brand/x/x-logo-lockup-white-on-black.svg",
} as const;

/**
 * A platform's glyph for destination rows. Every platform sits in the same
 * 30×24 slot: YouTube's mark untiled; X as the theme lockup; every other
 * platform on a 24 px tinted tile. Twin of Electron `PlatformGlyph`.
 */
export function PlatformGlyph({
  platform,
  className,
}: {
  platform: StreamPlatform;
  className?: string;
}): ReactElement {
  if (platform === "youtube") {
    return (
      <span
        className={cn("flex h-6 w-7.5 shrink-0 items-center justify-center", className)}
        data-platform-glyph="youtube"
      >
        <YoutubeIcon aria-label="YouTube" role="img" />
      </span>
    );
  }
  if (platform === "x") {
    return (
      <span
        className={cn("flex h-6 w-7.5 shrink-0 items-center justify-center", className)}
        data-platform-glyph="x"
        role="img"
        aria-label="X"
      >
        <img alt="" className="size-6 dark:hidden" draggable={false} src={X_LOCKUP.light} />
        <img
          alt=""
          className="hidden size-6 dark:block"
          draggable={false}
          src={X_LOCKUP.dark}
        />
      </span>
    );
  }
  const AppMark = PLATFORM_ICON[platform];
  return (
    <span
      className={cn("flex h-6 w-7.5 shrink-0 items-center justify-center", className)}
      data-platform-glyph={platform}
    >
      <span
        className={cn(
          "flex size-6 items-center justify-center rounded-chip",
          PLATFORM_GLYPH_TINT[platform]
        )}
      >
        <AppMark className="size-4" weight="fill" />
      </span>
    </span>
  );
}
