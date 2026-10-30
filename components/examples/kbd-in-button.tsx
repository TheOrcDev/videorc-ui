"use client";

import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";
import { ShortcutKeys } from "@/components/ui/shortcut-keys";

const KbdInButton = () => (
  <div className="flex flex-wrap items-center gap-2">
    <Button variant="secondary">
      Cancel
      <Kbd>Esc</Kbd>
    </Button>
    <Button>
      Go live
      <ShortcutKeys accelerator="CmdOrCtrl+Enter" />
    </Button>
    <Button variant="destructive">
      Dismiss
      <ShortcutKeys accelerator="Backspace" />
    </Button>
  </div>
);

export default KbdInButton;
