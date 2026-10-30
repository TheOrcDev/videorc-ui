"use client";

import { HiddenIcon, MarkerIcon, PinIcon } from "@/components/icons";
import { Toggle } from "@/components/ui/toggle";

const ToggleDemo = () => (
  <div className="flex items-center gap-1">
    <Toggle aria-label="Keep on top" defaultPressed>
      <PinIcon />
    </Toggle>
    <Toggle aria-label="Hide screen">
      <HiddenIcon />
    </Toggle>
    <Toggle>
      <MarkerIcon data-icon="inline-start" />
      Markers
    </Toggle>
  </div>
);

export default ToggleDemo;
