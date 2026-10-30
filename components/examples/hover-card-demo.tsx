"use client";

import { TwitchIcon } from "@/components/icons";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

const HoverCardDemo = () => (
  <p className="text-sm">
    Streaming to{" "}
    <HoverCard>
      <HoverCardTrigger
        closeDelay={80}
        delay={400}
        href="https://www.twitch.tv"
        rel="noopener noreferrer"
        target="_blank"
      >
        <span className="font-medium underline-offset-4 hover:underline">
          Twitch
        </span>
      </HoverCardTrigger>
      <HoverCardContent align="start">
        <div className="flex gap-3">
          <TwitchIcon className="text-platform-twitch-ink size-5 shrink-0" />
          <div className="flex flex-col gap-1">
            <p className="font-medium">orcdev on Twitch</p>
            <p className="text-meta text-muted-foreground">
              Live for 1:12:04 at 6,000 kbps, with no dropped frames.
            </p>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  </p>
);

export default HoverCardDemo;
