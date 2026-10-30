"use client";

import { ShortcutKeys } from "@/components/ui/shortcut-keys";

const ShortcutKeysText = () => (
  <div className="h-status-bar text-muted-foreground flex w-full max-w-sm items-center justify-between border-t px-3 text-xs">
    <span>Ready to record</span>
    <span className="flex items-center gap-1.5">
      Search
      <ShortcutKeys accelerator="CmdOrCtrl+K" variant="text" />
    </span>
  </div>
);

export default ShortcutKeysText;
