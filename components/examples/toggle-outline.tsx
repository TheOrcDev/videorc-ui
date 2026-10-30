"use client";

import { useState } from "react";

import { Toggle } from "@/components/ui/toggle";

const ToggleOutline = () => {
  const [freeform, setFreeform] = useState(false);
  return (
    <div className="flex items-center gap-2">
      <Toggle
        onPressedChange={setFreeform}
        pressed={freeform}
        variant="outline"
      >
        Freeform
      </Toggle>
      <Toggle defaultPressed size="xs" variant="outline">
        Snap
      </Toggle>
    </div>
  );
};

export default ToggleOutline;
