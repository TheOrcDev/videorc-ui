"use client";

import { SegmentedControl } from "@/components/ui/segmented-control";

const ORIENTATIONS = [
  { label: "Horizontal", value: "horizontal" },
  { label: "Vertical", value: "vertical" },
] as const;

const SegmentedControlDisabled = () => (
  <SegmentedControl
    aria-label="Studio orientation"
    disabled
    disabledReason="Locked while you’re recording or live. Stop to switch orientation."
    onValueChange={() => null}
    options={ORIENTATIONS}
    value="horizontal"
  />
);

export default SegmentedControlDisabled;
