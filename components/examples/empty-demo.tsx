"use client";

import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";

const EmptyDemo = () => (
  <Empty>
    <EmptyHeader>
      <EmptyTitle>No recordings yet</EmptyTitle>
      <EmptyDescription>
        Recordings you make in the Studio show up here.
      </EmptyDescription>
    </EmptyHeader>
    <EmptyContent>
      <Button variant="secondary">Open Studio</Button>
    </EmptyContent>
  </Empty>
);

export default EmptyDemo;
