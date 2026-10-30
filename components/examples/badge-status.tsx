"use client";

import { CheckIcon, WarningIcon } from "@/components/icons";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";

const BadgeStatus = () => (
  <div className="flex flex-col items-center gap-3">
    <div className="flex flex-wrap items-center gap-2">
      <Badge variant="success">Connected</Badge>
      <Badge variant="warning">Reconnecting</Badge>
      <Badge variant="neutral">Idle</Badge>
    </div>
    <div className="flex flex-wrap items-center gap-2">
      <Badge variant="success">
        <CheckIcon data-icon="inline-start" weight="bold" />
        Saved
      </Badge>
      <Badge variant="warning">
        <WarningIcon data-icon="inline-start" weight="fill" />
        Dropped frames
      </Badge>
      <Badge variant="neutral">
        <Spinner aria-hidden data-icon="inline-start" />
        Uploading
      </Badge>
    </div>
  </div>
);

export default BadgeStatus;
