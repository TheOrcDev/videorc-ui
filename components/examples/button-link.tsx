"use client";

import { ExternalLinkIcon } from "@/components/icons";
import { buttonVariants } from "@/components/ui/button";

const ButtonLink = () => (
  <a
    className={buttonVariants({ variant: "outline" })}
    href="https://videorc.com"
    rel="noopener noreferrer"
    target="_blank"
  >
    Open videorc.com
    <ExternalLinkIcon data-icon="inline-end" />
  </a>
);

export default ButtonLink;
