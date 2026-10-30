"use client";

import { StatusBadge } from "@/components/status-badge";

const StatusBadgeDemo = () => (
  <div className="flex flex-wrap items-center gap-2">
    <StatusBadge tone="good" value="Connected" />
    <StatusBadge tone="warn" value="Reconnecting" />
    <StatusBadge tone="error" value="Upload failed" />
    <StatusBadge tone="live" value="On air" />
    <StatusBadge value="Idle" />
  </div>
);

export default StatusBadgeDemo;
