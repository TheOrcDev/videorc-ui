"use client";

import { Badge } from "@/components/ui/badge";
import { InfoTooltip } from "@/components/ui/info-tooltip";

const InfoTooltipDemo = () => (
  <div className="flex items-center gap-2">
    <InfoTooltip content="The disk is full. Free up space, then export again.">
      <Badge variant="destructive">MP4 failed</Badge>
    </InfoTooltip>
    <InfoTooltip content="Twitch dropped 2% of frames in the last minute.">
      <Badge variant="warning">Dropped frames</Badge>
    </InfoTooltip>
  </div>
);

export default InfoTooltipDemo;
