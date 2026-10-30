"use client";

import { useState } from "react";

import { TwitchIcon, YoutubeIcon } from "@/components/icons";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

const ToggleGroupDemo = () => {
  const [platform, setPlatform] = useState(["all"]);
  return (
    <ToggleGroup
      aria-label="Show chat from"
      // Pressing the pressed chip again clears the filter: back to All.
      onValueChange={(next) => setPlatform(next.length > 0 ? next : ["all"])}
      value={platform}
    >
      <ToggleGroupItem value="all">All</ToggleGroupItem>
      <ToggleGroupItem value="youtube">
        <YoutubeIcon data-icon="inline-start" />
        YouTube
      </ToggleGroupItem>
      <ToggleGroupItem value="twitch">
        <TwitchIcon data-icon="inline-start" />
        Twitch
      </ToggleGroupItem>
    </ToggleGroup>
  );
};

export default ToggleGroupDemo;
