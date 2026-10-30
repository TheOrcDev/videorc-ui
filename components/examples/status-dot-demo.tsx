"use client";

import { StatusDot } from "@/components/status-dot";

const StatusDotDemo = () => (
  <div className="flex flex-wrap items-center gap-4">
    <StatusDot label="Recording" pulse tone="live" />
    <StatusDot label="Ready" tone="good" />
    <StatusDot label="Reconnecting" pulse tone="warn" />
    <StatusDot label="Encoder stopped" tone="error" />
    <StatusDot label="Idle" />
  </div>
);

export default StatusDotDemo;
