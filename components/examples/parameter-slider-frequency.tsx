"use client";

import {
  ParameterSlider,
  ParameterSliderControl,
  ParameterSliderDescription,
  ParameterSliderHeader,
  ParameterSliderLabel,
  ParameterSliderMarks,
  ParameterSliderValue,
} from "@/components/ui/parameter-slider";

const KILOHERTZ = 1000;

const formatHz = (hz: number) =>
  hz >= KILOHERTZ
    ? `${(hz / KILOHERTZ).toFixed(1)} kHz`
    : `${Math.round(hz)} Hz`;

const MARKS = [
  { label: "20", value: 20 },
  { label: "50", value: 50 },
  { label: "100", value: 100 },
  { label: "200", value: 200 },
  { label: "500", value: 500 },
  { label: "1k", value: 1000 },
];

const ParameterSliderFrequency = () => (
  <ParameterSlider
    className="max-w-sm"
    defaultValue={80}
    format={formatHz}
    marks={MARKS}
    max={1000}
    min={20}
    scale="log"
    step={1}
  >
    <ParameterSliderHeader>
      <ParameterSliderLabel>Microphone low cut</ParameterSliderLabel>
      <ParameterSliderValue />
    </ParameterSliderHeader>
    <ParameterSliderControl />
    <ParameterSliderMarks />
    <ParameterSliderDescription>
      Filters out rumble below this frequency, like a desk fan or a footstep.
    </ParameterSliderDescription>
  </ParameterSlider>
);

export default ParameterSliderFrequency;
