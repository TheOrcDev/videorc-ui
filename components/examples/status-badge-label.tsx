"use client";

import {
  CameraIcon,
  ChatIcon,
  MicrophoneIcon,
  YoutubeIcon,
} from "@/components/icons";
import { StatusBadge } from "@/components/status-badge";

const StatusBadgeLabel = () => (
  <div className="flex flex-wrap items-center gap-2">
    <StatusBadge label="Chat" tone="good" value="Read and write" />
    <StatusBadge label="Captions" tone="warn" value="Delayed" />
    <StatusBadge icon={CameraIcon} tone="warn" value="Needs permission" />
    <StatusBadge icon={MicrophoneIcon} tone="good" value="Ready" />
    <StatusBadge icon={YoutubeIcon} tone="live" value="On air" />
    <StatusBadge
      icon={ChatIcon}
      label="Twitch"
      tone="error"
      value="Disconnected"
    />
  </div>
);

export default StatusBadgeLabel;
