"use client";

import { Badge } from "@/components/ui/badge";

const BadgeDemo = () => (
  <div className="flex flex-wrap items-center gap-2">
    <Badge variant="live">On air</Badge>
    <Badge variant="success">Connected</Badge>
    <Badge variant="outline">9:16</Badge>
    <Badge>1080p60</Badge>
  </div>
);

export default BadgeDemo;
