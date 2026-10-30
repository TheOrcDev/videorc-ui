"use client";

import { ExternalLinkIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";

const ButtonLink = () => (
  <Button
    nativeButton={false}
    render={
      // oxlint-disable-next-line jsx-a11y/control-has-associated-label -- Base UI renders the label into it.
      <a href="https://videorc.com" rel="noopener noreferrer" target="_blank" />
    }
    variant="outline"
  >
    Open videorc.com
    <ExternalLinkIcon data-icon="inline-end" />
  </Button>
);

export default ButtonLink;
