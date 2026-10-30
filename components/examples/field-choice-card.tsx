"use client";

import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field";

const DESTINATIONS = [
  { checked: true, detail: "Public · 1080p60", name: "YouTube" },
  { checked: false, detail: "Just Chatting · 6,000 kbps", name: "Twitch" },
];

const FieldChoiceCard = () => (
  <FieldGroup className="max-w-sm" data-slot="checkbox-group">
    {DESTINATIONS.map((destination) => (
      <FieldLabel key={destination.name}>
        <Field orientation="horizontal">
          <Checkbox defaultChecked={destination.checked} />
          <FieldContent>
            <FieldTitle>{destination.name}</FieldTitle>
            <FieldDescription>{destination.detail}</FieldDescription>
          </FieldContent>
        </Field>
      </FieldLabel>
    ))}
  </FieldGroup>
);

export default FieldChoiceCard;
