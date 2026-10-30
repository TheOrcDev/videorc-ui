"use client";

import { useState } from "react";

import { CameraIcon } from "@/components/icons";
import { PowerSlider } from "@/components/power-slider";

const PowerSliderBipolar = () => {
  const [value, setValue] = useState(0.5);
  return (
    <PowerSlider
      bipolar
      className="w-full max-w-sm"
      defaultValue={0}
      icon={CameraIcon}
      label="Exposure"
      marks={[
        { label: "Darker", value: -2 },
        { label: "Auto", value: 0 },
        { label: "Brighter", value: 2 },
      ]}
      max={2}
      min={-2}
      onChange={setValue}
      step={0.1}
      suffix=" EV"
      value={value}
    />
  );
};

export default PowerSliderBipolar;
