"use client";

import { RecordIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";

const ButtonDemo = () => (
  <div className="flex flex-wrap items-center gap-2">
    <Button variant="record">
      <RecordIcon data-icon="inline-start" weight="fill" />
      Record
    </Button>
    <Button>Go Live…</Button>
    <Button variant="secondary">Open Stream Manager</Button>
    <Button variant="ghost">Cancel</Button>
  </div>
);

export default ButtonDemo;
