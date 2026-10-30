"use client";

import { Badge } from "@/components/ui/badge";

const BadgeVariants = () => (
  <div className="flex max-w-md flex-wrap items-center justify-center gap-2">
    <Badge>1080p60</Badge>
    <Badge variant="outline">Beta</Badge>
    <Badge variant="success">Connected</Badge>
    <Badge variant="warning">Reconnecting</Badge>
    <Badge variant="neutral">Idle</Badge>
    <Badge variant="destructive">Failed</Badge>
    <Badge variant="live">On air</Badge>
    <Badge variant="chrome">On stream</Badge>
    <Badge variant="plate">Member</Badge>
    <Badge variant="ghost">Draft</Badge>
  </div>
);

export default BadgeVariants;
