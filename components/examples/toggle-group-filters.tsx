"use client";

import { useState } from "react";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

const KINDS = [
  { count: 14, id: "silences", label: "Silences" },
  { count: 9, id: "fillers", label: "Ums" },
  { count: 3, id: "retakes", label: "Retakes" },
  { count: 2, id: "false-starts", label: "False starts" },
];

const ToggleGroupFilters = () => {
  const [kinds, setKinds] = useState(["silences", "fillers"]);
  return (
    <ToggleGroup
      aria-label="Kinds of cuts"
      className="max-w-xs flex-wrap"
      multiple
      onValueChange={setKinds}
      size="xs"
      spacing={1}
      value={kinds}
    >
      {KINDS.map((kind) => (
        <ToggleGroupItem key={kind.id} value={kind.id}>
          {kind.label}
          <span className="text-muted-foreground tabular-nums">
            {kind.count}
          </span>
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
};

export default ToggleGroupFilters;
