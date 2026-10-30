"use client";

import { useState } from "react";

import {
  CameraIcon,
  GaugeIcon,
  LivestreamIcon,
  MicrophoneIcon,
  OutputIcon,
} from "@/components/icons";
import { GroupedList } from "@/components/list-row";
import {
  NavigableRow,
  NavigableRowHintLines,
} from "@/components/navigable-row";

const NavigableRowDemo = () => {
  const [opened, setOpened] = useState<string | null>(null);
  return (
    <div className="flex w-full max-w-sm flex-col gap-2">
      <GroupedList aria-label="Session" label="Session">
        <NavigableRow
          icon={CameraIcon}
          label="Camera"
          onNavigate={() => setOpened("Sources")}
          value="FaceTime HD Camera"
        />
        <NavigableRow
          icon={MicrophoneIcon}
          label="Microphone"
          onNavigate={() => setOpened("Sources")}
          value="Shure MV7"
        />
        <NavigableRow
          hint={
            <NavigableRowHintLines
              lines={["1920 × 1080", "60 fps", "12 Mbps"]}
            />
          }
          icon={OutputIcon}
          label="Recording"
          onNavigate={() => setOpened("Output")}
          value="1080p · 60 fps"
        />
        <NavigableRow
          hint={<NavigableRowHintLines lines={["YouTube", "Twitch"]} />}
          icon={LivestreamIcon}
          label="Destinations"
          onNavigate={() => setOpened("Livestream")}
          value="2 on"
        />
        <NavigableRow icon={GaugeIcon} label="Dropped frames" value="0" />
      </GroupedList>
      <p aria-live="polite" className="text-meta text-muted-foreground px-1">
        {opened ? `Opened ${opened}.` : "Choose a row to open its page."}
      </p>
    </div>
  );
};

export default NavigableRowDemo;
