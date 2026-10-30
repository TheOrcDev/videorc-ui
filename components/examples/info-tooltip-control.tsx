"use client";

import { ExternalLinkIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { InfoTooltip } from "@/components/ui/info-tooltip";

const InfoTooltipControl = () => (
  <InfoTooltip
    content="Opens x.com to approve live broadcasting for this account."
    focusable={false}
  >
    <Button variant="secondary">
      Authorize X Live
      <ExternalLinkIcon data-icon="inline-end" />
    </Button>
  </InfoTooltip>
);

export default InfoTooltipControl;
