"use client";

import { useState } from "react";

import { SegmentedControl } from "@/components/ui/segmented-control";

type Theme = "light" | "dark" | "system";

const THEMES = [
  { label: "Light", value: "light" },
  { label: "Dark", value: "dark" },
  { label: "System", value: "system" },
] as const;

const SegmentedControlDemo = () => {
  const [theme, setTheme] = useState<Theme>("system");
  return (
    <SegmentedControl
      aria-label="Theme"
      onValueChange={setTheme}
      options={THEMES}
      value={theme}
    />
  );
};

export default SegmentedControlDemo;
