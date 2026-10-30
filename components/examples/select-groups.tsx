"use client";

import { Field, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const SOURCES = [
  {
    items: [
      { label: "Built-in Retina display", value: "display-built-in" },
      { label: "Studio Display", value: "display-studio" },
    ],
    label: "Displays",
  },
  {
    items: [
      { label: "Keynote", value: "window-keynote" },
      { label: "Safari", value: "window-safari" },
    ],
    label: "Windows",
  },
];

const ITEMS = SOURCES.flatMap((group) => group.items);

const SelectGroups = () => (
  <Field className="w-60">
    <FieldLabel>Screen</FieldLabel>
    <Select defaultValue="display-built-in" items={ITEMS}>
      <SelectTrigger className="w-full">
        <SelectValue />
      </SelectTrigger>
      <SelectContent alignItemWithTrigger={false}>
        {SOURCES.map((group, index) => (
          <SelectGroup key={group.label}>
            {index > 0 ? <SelectSeparator /> : null}
            <SelectLabel>{group.label}</SelectLabel>
            {group.items.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectGroup>
        ))}
      </SelectContent>
    </Select>
  </Field>
);

export default SelectGroups;
