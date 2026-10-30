"use client";

import { useState } from "react";

import {
  Fader,
  FaderLabel,
  FaderRange,
  FaderScale,
  FaderThumb,
  FaderTrack,
  FaderValue,
} from "@/components/ui/fader";

const CHANNELS = ["Mic", "System", "Camera"] as const;

type Channel = (typeof CHANNELS)[number];

const FaderConsole = () => {
  const [levels, setLevels] = useState<Record<Channel, number>>({
    Camera: -18,
    Mic: 0,
    System: -12,
  });

  return (
    <div className="flex h-64 gap-6">
      {CHANNELS.map((channel) => (
        <Fader
          className="flex-col items-center"
          key={channel}
          onValueChange={(value) =>
            setLevels((current) => ({ ...current, [channel]: value }))
          }
          orientation="vertical"
          taper="audio"
          value={levels[channel]}
          variant="console"
        >
          <FaderValue />
          <div className="flex min-h-0 flex-1 gap-1">
            <FaderTrack>
              <FaderRange />
              <FaderThumb />
            </FaderTrack>
            <FaderScale />
          </div>
          <FaderLabel>{channel}</FaderLabel>
        </Fader>
      ))}
    </div>
  );
};

export default FaderConsole;
