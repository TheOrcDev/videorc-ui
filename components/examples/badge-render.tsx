"use client";

import { useState } from "react";

import { ArrowDownIcon } from "@/components/icons";
import { Badge } from "@/components/ui/badge";

const BadgeRender = () => {
  const [unread, setUnread] = useState(12);
  return (
    <Badge
      // oxlint-disable-next-line jsx-a11y/control-has-associated-label -- Base UI renders the label into it.
      render={<button onClick={() => setUnread(0)} type="button" />}
    >
      {unread > 0 ? `${unread} new` : "Latest"}
      <ArrowDownIcon data-icon="inline-end" />
    </Badge>
  );
};

export default BadgeRender;
