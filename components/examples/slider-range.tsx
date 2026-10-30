"use client";

import { Slider } from "@/components/ui/slider";

const SliderRange = () => (
  <Slider
    aria-label="Clip"
    className="max-w-sm"
    defaultValue={[12, 48]}
    format={{ style: "unit", unit: "second" }}
    max={60}
    minStepsBetweenValues={5}
  />
);

export default SliderRange;
