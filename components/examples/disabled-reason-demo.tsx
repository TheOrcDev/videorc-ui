"use client";

import { Button } from "@/components/ui/button";
import { DisabledReason } from "@/components/ui/disabled-reason";

const DisabledReasonDemo = () => (
  <div className="flex items-center gap-2">
    <DisabledReason reason="Add a destination before you go live.">
      <Button disabled>Go Live…</Button>
    </DisabledReason>
    <DisabledReason reason="Stop the recording before you delete it.">
      <Button disabled variant="destructive">
        Delete
      </Button>
    </DisabledReason>
  </div>
);

export default DisabledReasonDemo;
