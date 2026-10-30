"use client";

import { StatusDot } from "@/components/status-dot";

// Ambient status in a header or a status bar: the dot carries the tone, the
// word stays quiet beside the title.
const StatusDotHeader = () => (
  <div className="rounded-row h-toolbar flex w-full max-w-sm items-center justify-between gap-3 border px-3">
    <span className="text-section">Captions reader</span>
    <StatusDot label="Listening" pulse tone="good" />
  </div>
);

export default StatusDotHeader;
