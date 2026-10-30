"use client";

import { Kbd, KbdGroup } from "@/components/ui/kbd";

const KbdDemo = () => (
  <div className="text-muted-foreground flex flex-col gap-2 text-sm">
    <p className="flex items-center gap-2">
      <KbdGroup>
        <Kbd>↑</Kbd>
        <Kbd>↓</Kbd>
      </KbdGroup>
      Move between questions
    </p>
    <p className="flex items-center gap-2">
      <Kbd>Esc</Kbd>
      Dismiss Buddy’s proposed post
    </p>
  </div>
);

export default KbdDemo;
