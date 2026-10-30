"use client";

import { useState } from "react";

import {
  ParameterSlider,
  ParameterSliderControl,
  ParameterSliderHeader,
  ParameterSliderLabel,
  ParameterSliderValue,
} from "@/components/ui/parameter-slider";

const ParameterSliderValueExample = () => {
  const [opacity, setOpacity] = useState(85);

  return (
    <ParameterSlider
      className="max-w-sm"
      largeStep={10}
      max={100}
      min={20}
      onValueChange={setOpacity}
      resetValue={100}
      step={1}
      unit="%"
      value={opacity}
    >
      <ParameterSliderHeader>
        <ParameterSliderLabel>Banner opacity</ParameterSliderLabel>
        <ParameterSliderValue />
      </ParameterSliderHeader>
      <ParameterSliderControl />
    </ParameterSlider>
  );
};

export default ParameterSliderValueExample;
