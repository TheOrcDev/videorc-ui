"use client";

import { useState } from "react";

import {
  Fader,
  FaderLabel,
  FaderRange,
  FaderReset,
  FaderScale,
  FaderThumb,
  FaderTrack,
  FaderValue,
} from "@/components/ui/fader";

const FaderDemo = () => {
  const [volumeDb, setVolumeDb] = useState(-6);

  return (
    <Fader className="max-w-sm" onValueChange={setVolumeDb} value={volumeDb}>
      <div className="flex items-center gap-2">
        <FaderLabel className="mr-auto">Microphone</FaderLabel>
        <FaderReset />
        <FaderValue />
      </div>
      <FaderTrack>
        <FaderRange />
        <FaderThumb />
      </FaderTrack>
      <FaderScale />
    </Fader>
  );
};

export default FaderDemo;
