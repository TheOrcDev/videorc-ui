"use client";

import { ShortcutKeys } from "@/components/ui/shortcut-keys";

const SHORTCUTS = [
  { accelerator: "CmdOrCtrl+K", label: "Search" },
  { accelerator: "CmdOrCtrl+P", label: "Open Preview" },
  { accelerator: "CmdOrCtrl+Shift+J", label: "Open Stream Manager" },
  { accelerator: "Space", label: "Start or stop recording" },
];

const ShortcutKeysDemo = () => (
  <ul className="flex w-full max-w-xs flex-col gap-2 text-sm">
    {SHORTCUTS.map((shortcut) => (
      <li
        className="flex items-center justify-between gap-4"
        key={shortcut.label}
      >
        {shortcut.label}
        <ShortcutKeys accelerator={shortcut.accelerator} />
      </li>
    ))}
  </ul>
);

export default ShortcutKeysDemo;
