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

const GAIN_DETENTS = [0];
const GAIN_TICKS = [-24, -12, 0, 12, 24];

const FaderGain = () => {
  const [gainDb, setGainDb] = useState(0);

  return (
    <Fader
      className="max-w-sm"
      detents={GAIN_DETENTS}
      fineStep={1}
      largeStep={6}
      max={24}
      min={-24}
      onValueChange={setGainDb}
      origin={0}
      step={1}
      value={gainDb}
    >
      <div className="flex items-center gap-2">
        <FaderLabel className="mr-auto">Microphone gain</FaderLabel>
        <FaderReset />
        <FaderValue editable />
      </div>
      <FaderTrack>
        <FaderRange />
        <FaderThumb />
      </FaderTrack>
      <FaderScale ticks={GAIN_TICKS} />
    </Fader>
  );
};

export default FaderGain;
