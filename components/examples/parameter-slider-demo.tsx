"use client";

import { useState } from "react";

import {
  ParameterSlider,
  ParameterSliderControl,
  ParameterSliderDescription,
  ParameterSliderHeader,
  ParameterSliderInput,
  ParameterSliderLabel,
  ParameterSliderReset,
} from "@/components/ui/parameter-slider";

const ParameterSliderDemo = () => {
  const [offsetMs, setOffsetMs] = useState(0);

  return (
    <ParameterSlider
      className="max-w-sm"
      largeStep={5}
      max={1000}
      min={-1000}
      onValueChange={setOffsetMs}
      origin={0}
      resetValue={0}
      step={1}
      unit="ms"
      value={offsetMs}
    >
      <ParameterSliderHeader>
        <ParameterSliderLabel>Microphone sync</ParameterSliderLabel>
        <ParameterSliderReset />
        <ParameterSliderInput />
      </ParameterSliderHeader>
      <ParameterSliderControl />
      <ParameterSliderDescription>
        Moves your voice later (+) or earlier (−) to line up with the video.
      </ParameterSliderDescription>
    </ParameterSlider>
  );
};

export default ParameterSliderDemo;
