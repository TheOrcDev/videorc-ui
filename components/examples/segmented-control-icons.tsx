"use client";

import { useState } from "react";

import { DesktopIcon, MobileIcon } from "@/components/icons";
import { SegmentedControl } from "@/components/ui/segmented-control";

type Orientation = "horizontal" | "vertical";

const ORIENTATIONS = [
  {
    "aria-label": "Horizontal",
    label: <DesktopIcon />,
    tooltip: "Horizontal · 16:9",
    value: "horizontal",
  },
  {
    "aria-label": "Vertical",
    label: <MobileIcon />,
    tooltip: "Vertical · 9:16",
    value: "vertical",
  },
] as const;

const SegmentedControlIcons = () => {
  const [orientation, setOrientation] = useState<Orientation>("horizontal");
  return (
    <SegmentedControl
      aria-label="Studio orientation"
      onValueChange={setOrientation}
      options={ORIENTATIONS}
      value={orientation}
    />
  );
};

export default SegmentedControlIcons;
