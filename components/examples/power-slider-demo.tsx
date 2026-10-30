"use client";

import { useState } from "react";

import { WaveformIcon } from "@/components/icons";
import { PowerSlider } from "@/components/power-slider";

const PowerSliderDemo = () => {
  const [value, setValue] = useState(60);
  return (
    <PowerSlider
      className="w-full max-w-sm"
      defaultValue={40}
      icon={WaveformIcon}
      label="Noise cleanup"
      max={100}
      min={0}
      onChange={setValue}
      rangeHints
      status={{ label: "Beta" }}
      suffix="%"
      value={value}
    />
  );
};

export default PowerSliderDemo;
