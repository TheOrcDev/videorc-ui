"use client";

import { useState } from "react";

import { MicrophoneIcon } from "@/components/icons";
import { PowerSlider } from "@/components/power-slider";

const noop = () => {
  // Disabled: it never changes.
};

const PowerSliderNumeric = () => {
  const [delay, setDelay] = useState(120);
  const [committed, setCommitted] = useState(120);
  return (
    <div className="flex w-full max-w-sm flex-col gap-6">
      <PowerSlider
        defaultValue={0}
        icon={MicrophoneIcon}
        label="Mic delay"
        largeStep={100}
        max={1000}
        min={0}
        numericInput
        onChange={setDelay}
        onCommit={setCommitted}
        step={10}
        suffix=" ms"
        value={delay}
      />
      <p className="text-muted-foreground text-meta">
        Saved: {committed} ms. The live value follows the drag; the saved one
        changes on release.
      </p>
      <PowerSlider
        disabled
        disabledReason="Turn on a microphone to adjust its gain."
        label="Gain"
        max={24}
        min={0}
        onChange={noop}
        status={{ label: "No microphone", tone: "warning" }}
        suffix=" dB"
        value={0}
      />
    </div>
  );
};

export default PowerSliderNumeric;
