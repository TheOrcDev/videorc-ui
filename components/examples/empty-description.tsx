"use client";

import { Empty, EmptyDescription, EmptyHeader } from "@/components/ui/empty";

const EmptyDescriptionExample = () => (
  <div className="rounded-row flex h-40 w-full max-w-sm border">
    <Empty>
      <EmptyHeader>
        <EmptyDescription>No messages match these filters.</EmptyDescription>
      </EmptyHeader>
    </Empty>
  </div>
);

export default EmptyDescriptionExample;
