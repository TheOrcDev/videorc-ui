"use client";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const LAYOUTS = [
  { label: "Camera only", value: "camera" },
  { label: "Screen and camera", value: "screen-camera" },
  { label: "Screen only", value: "screen" },
];

const LayoutSelect = ({ size }: { size: "default" | "xs" }) => (
  <Select defaultValue="screen-camera" items={LAYOUTS}>
    <SelectTrigger aria-label="Layout" size={size}>
      <SelectValue />
    </SelectTrigger>
    <SelectContent>
      <SelectGroup>
        {LAYOUTS.map((layout) => (
          <SelectItem key={layout.value} value={layout.value}>
            {layout.label}
          </SelectItem>
        ))}
      </SelectGroup>
    </SelectContent>
  </Select>
);

const SelectSizes = () => (
  <div className="flex flex-wrap items-center gap-2">
    <LayoutSelect size="default" />
    <LayoutSelect size="xs" />
  </div>
);

export default SelectSizes;
