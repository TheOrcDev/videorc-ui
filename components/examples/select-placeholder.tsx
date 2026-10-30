"use client";

import { Field, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// The null item is the placeholder: the trigger shows its label until a
// destination is chosen. It isn't in the list, so it can't be chosen back.
const DESTINATIONS = [
  { label: "Choose a destination", value: null },
  { label: "YouTube", value: "youtube" },
  { label: "Twitch", value: "twitch" },
  { label: "Kick", value: "kick" },
];

const SelectPlaceholder = () => (
  <Field className="w-56">
    <FieldLabel>Stream to</FieldLabel>
    <Select items={DESTINATIONS}>
      <SelectTrigger className="w-full">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {DESTINATIONS.filter((entry) => entry.value !== null).map((entry) => (
            <SelectItem key={entry.value} value={entry.value}>
              {entry.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  </Field>
);

export default SelectPlaceholder;
