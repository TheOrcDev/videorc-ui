"use client";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

const ToggleGroupOutline = () => (
  <ToggleGroup
    aria-label="Show in the preview"
    defaultValue={["safe-areas"]}
    multiple
    spacing={0}
    variant="outline"
  >
    <ToggleGroupItem value="safe-areas">Safe areas</ToggleGroupItem>
    <ToggleGroupItem value="grid">Grid</ToggleGroupItem>
    <ToggleGroupItem value="names">Source names</ToggleGroupItem>
  </ToggleGroup>
);

export default ToggleGroupOutline;
