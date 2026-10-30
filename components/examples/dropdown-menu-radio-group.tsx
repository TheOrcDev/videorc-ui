"use client";

import { useState } from "react";

import { SendIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const DESTINATIONS = [
  { label: "All destinations", value: "all" },
  { label: "YouTube", value: "youtube" },
  { label: "Twitch", value: "twitch" },
] as const;

const DropdownMenuRadioGroupExample = () => {
  const [destination, setDestination] = useState<string>("all");
  const label = DESTINATIONS.find(
    (entry) => entry.value === destination
  )?.label;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="secondary" />}>
        <SendIcon data-icon="inline-start" />
        {label}
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-52">
        <DropdownMenuLabel>Send to</DropdownMenuLabel>
        <DropdownMenuRadioGroup
          onValueChange={(value: string) => setDestination(value)}
          value={destination}
        >
          {DESTINATIONS.map((entry) => (
            <DropdownMenuRadioItem key={entry.value} value={entry.value}>
              {entry.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default DropdownMenuRadioGroupExample;
