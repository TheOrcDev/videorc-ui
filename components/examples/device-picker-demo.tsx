"use client";

import { useEffect, useState } from "react";

import { DevicePicker } from "@/components/device-picker";
import type { PickerDevice } from "@/components/device-picker";
import { Button } from "@/components/ui/button";

const DISCOVERY_TAKES_MS = 1500;

const CAMERAS: PickerDevice[] = [
  {
    id: "facetime",
    kind: "camera",
    name: "FaceTime HD Camera",
    status: "available",
  },
  { id: "desk", kind: "camera", name: "Desk Camera", status: "available" },
  {
    id: "cam-link",
    kind: "camera",
    name: "Cam Link 4K",
    status: "permission-required",
  },
];

const MICROPHONES: PickerDevice[] = [
  {
    id: "built-in",
    kind: "microphone",
    name: "MacBook Pro Microphone",
    status: "available",
  },
  { id: "shure", kind: "microphone", name: "Shure MV7", status: "available" },
  {
    id: "airpods",
    kind: "microphone",
    name: "AirPods Pro",
    status: "unavailable",
  },
];

const DevicePickerDemo = () => {
  const [pending, setPending] = useState(true);
  const [cameraId, setCameraId] = useState<string | undefined>("facetime");
  const [microphoneId, setMicrophoneId] = useState<string | undefined>();

  // Discovery reports after a moment, as it does when a window opens.
  useEffect(() => {
    if (!pending) {
      return;
    }
    const timer = setTimeout(() => setPending(false), DISCOVERY_TAKES_MS);
    return () => clearTimeout(timer);
  }, [pending]);

  return (
    <div className="flex w-full max-w-xs flex-col gap-4">
      <DevicePicker
        devices={pending ? [] : CAMERAS}
        discoveryPending={pending}
        kind="camera"
        label="Camera"
        noneLabel="Off"
        onChange={setCameraId}
        selectedName="FaceTime HD Camera"
        value={cameraId}
      />
      <DevicePicker
        devices={pending ? [] : MICROPHONES}
        discoveryPending={pending}
        kind="microphone"
        label="Microphone"
        noneLabel="Off"
        onChange={setMicrophoneId}
        value={microphoneId}
      />
      <Button
        className="self-start"
        disabled={pending}
        onClick={() => setPending(true)}
        size="xs"
        variant="secondary"
      >
        Find devices again
      </Button>
    </div>
  );
};

export default DevicePickerDemo;
