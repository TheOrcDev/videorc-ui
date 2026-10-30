"use client";

import { useState } from "react";

import { SegmentedControl } from "@/components/ui/segmented-control";

type Fit = "fit" | "fill";
type TextSize = "sm" | "md" | "lg";

const FITS = [
  { label: "Fit", value: "fit" },
  { label: "Fill", value: "fill" },
] as const;

const TEXT_SIZES = [
  { "aria-label": "Small text", label: "Small", value: "sm" },
  { "aria-label": "Medium text", label: "Medium", value: "md" },
  { "aria-label": "Large text", label: "Large", value: "lg" },
] as const;

const SegmentedControlSizes = () => {
  const [fit, setFit] = useState<Fit>("fit");
  const [textSize, setTextSize] = useState<TextSize>("md");
  return (
    <div className="flex flex-col items-center gap-4">
      <SegmentedControl
        aria-label="Camera fit"
        onValueChange={setFit}
        options={FITS}
        value={fit}
      />
      <SegmentedControl
        activationMode="manual"
        aria-label="Text size"
        onValueChange={setTextSize}
        options={TEXT_SIZES}
        size="sm"
        value={textSize}
      />
    </div>
  );
};

export default SegmentedControlSizes;
