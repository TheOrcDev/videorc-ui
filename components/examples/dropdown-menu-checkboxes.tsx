"use client";

import { useState } from "react";

import { AdjustIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const EVENTS = [
  { id: "follows", label: "Follows" },
  { id: "subscriptions", label: "Subscriptions" },
  { id: "tips", label: "Tips and cheers" },
  { id: "raids", label: "Raids" },
] as const;

type EventId = (typeof EVENTS)[number]["id"];

const DropdownMenuCheckboxes = () => {
  const [shown, setShown] = useState<EventId[]>(["follows", "tips", "raids"]);
  const toggle = (id: EventId, checked: boolean) =>
    setShown((current) =>
      checked ? [...current, id] : current.filter((entry) => entry !== id)
    );
  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="secondary" />}>
        <AdjustIcon data-icon="inline-start" />
        Filter activity
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-52">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Show</DropdownMenuLabel>
          {EVENTS.map((event) => (
            <DropdownMenuCheckboxItem
              checked={shown.includes(event.id)}
              key={event.id}
              onCheckedChange={(checked) => toggle(event.id, checked)}
            >
              {event.label}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default DropdownMenuCheckboxes;
