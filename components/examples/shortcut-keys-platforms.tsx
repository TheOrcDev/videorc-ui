"use client";

import { ShortcutKeys } from "@/components/ui/shortcut-keys";

const ACCELERATORS = [
  "CmdOrCtrl+Shift+J",
  "CmdOrCtrl+Enter",
  "Shift+Backspace",
  "CmdOrCtrl+,",
];

const ShortcutKeysPlatforms = () => (
  <table className="text-sm">
    <thead className="text-muted-foreground text-xs">
      <tr>
        <th className="pr-6 pb-2 text-left font-medium">Accelerator</th>
        <th className="pr-6 pb-2 text-left font-medium">macOS</th>
        <th className="pb-2 text-left font-medium">Windows</th>
      </tr>
    </thead>
    <tbody>
      {ACCELERATORS.map((accelerator) => (
        <tr key={accelerator}>
          <td className="text-muted-foreground py-1 pr-6 font-mono text-xs">
            {accelerator}
          </td>
          <td className="py-1 pr-6">
            <ShortcutKeys accelerator={accelerator} platform="darwin" />
          </td>
          <td className="py-1">
            <ShortcutKeys accelerator={accelerator} platform="win32" />
          </td>
        </tr>
      ))}
    </tbody>
  </table>
);

export default ShortcutKeysPlatforms;
