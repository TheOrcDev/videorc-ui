"use client";

import { useState } from "react";

import { DevicePicker } from "@/components/device-picker";
import type { PickerDevice } from "@/components/device-picker";

const SOURCES: PickerDevice[] = [
  {
    id: "display-1",
    kind: "screen",
    name: "Built-in Retina Display",
    status: "available",
  },
  {
    id: "display-2",
    kind: "screen",
    name: "Studio Display",
    status: "available",
  },
  {
    detail: "Safari",
    id: "safari-docs",
    kind: "window",
    name: "Videorc docs",
    status: "available",
  },
  {
    detail: "Keynote",
    id: "keynote",
    kind: "window",
    name: "Launch slides",
    status: "available",
  },
  {
    detail: "Notes",
    id: "notes",
    kind: "window",
    name: "Show notes",
    status: "permission-required",
  },
];

const DevicePickerSearch = () => {
  const [value, setValue] = useState<string | undefined>("display-1");
  return (
    <div className="w-full max-w-xs">
      <DevicePicker
        devices={SOURCES}
        groupByKind
        kind="capture"
        label="Screen or window"
        noneLabel="None"
        onChange={setValue}
        searchable
        value={value}
      />
    </div>
  );
};

export default DevicePickerSearch;
