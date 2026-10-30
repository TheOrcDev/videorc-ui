"use client";

import { useState } from "react";

import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Slider } from "@/components/ui/slider";

const formatGain = (decibels: number) =>
  `${decibels > 0 ? "+" : ""}${decibels.toFixed(1)} dB`;

const SliderReadout = () => {
  const [gain, setGain] = useState(6);
  return (
    <Field className="max-w-sm">
      <div className="flex items-baseline justify-between gap-2">
        <FieldLabel>Microphone gain</FieldLabel>
        <output
          aria-hidden
          className="text-meta text-muted-foreground tabular-nums"
        >
          {formatGain(gain)}
        </output>
      </div>
      <Slider
        aria-valuetext={formatGain(gain)}
        max={20}
        min={-20}
        onValueChange={(value) => setGain(value)}
        step={0.5}
        value={gain}
      />
      <FieldDescription>
        Raise it until your voice peaks just under the red.
      </FieldDescription>
    </Field>
  );
};

export default SliderReadout;
