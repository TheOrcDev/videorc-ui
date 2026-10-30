"use client";

import { useState } from "react";

import { DevicePicker } from "@/components/device-picker";
import type { PickerDevice } from "@/components/device-picker";

const MICROPHONES: PickerDevice[] = [
  {
    id: "built-in",
    kind: "microphone",
    name: "MacBook Pro Microphone",
    status: "available",
  },
  { id: "shure", kind: "microphone", name: "Shure MV7", status: "available" },
];

const DevicePickerInline = () => {
  const [value, setValue] = useState<string | undefined>("usb-gone");
  return (
    <div className="rounded-row h-row flex w-full max-w-sm items-center justify-between gap-3 border pr-1 pl-3 text-sm">
      <span className="shrink-0">Microphone</span>
      <div className="min-w-0">
        <DevicePicker
          devices={MICROPHONES}
          kind="microphone"
          label="Microphone"
          noneLabel="Off"
          onChange={setValue}
          selectedName="Blue Yeti"
          trigger="inline"
          value={value}
        />
      </div>
    </div>
  );
};

export default DevicePickerInline;
