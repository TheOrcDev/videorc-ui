import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
  selectTriggerClassName,
} from "@/components/ui/select";

const FRAME_RATES = [
  { label: "30 fps", value: "30" },
  { label: "60 fps", value: "60" },
];

const FrameRateSelect = ({
  open,
  size,
}: {
  open?: boolean;
  size?: "xs" | "default";
}) => (
  <Select defaultOpen={open} defaultValue="60" items={FRAME_RATES}>
    <SelectTrigger aria-label="Frame rate" size={size}>
      <SelectValue />
    </SelectTrigger>
    <SelectContent>
      <SelectGroup>
        {FRAME_RATES.map((rate) => (
          <SelectItem key={rate.value} value={rate.value}>
            {rate.label}
          </SelectItem>
        ))}
      </SelectGroup>
    </SelectContent>
  </Select>
);

describe("Select", () => {
  it("makes 28 px the default trigger height, and 24 px the compact one", () => {
    expect(selectTriggerClassName).toContain("data-[size=default]:h-control");
    render(<FrameRateSelect size="xs" />);
    const trigger = screen.getByRole("combobox", { name: "Frame rate" });
    expect(trigger).toHaveAttribute("data-size", "xs");
    expect(trigger).toHaveClass("data-[size=xs]:h-6");
  });

  it("shows the chosen item's label, from items on the root", () => {
    render(<FrameRateSelect />);
    expect(
      screen.getByRole("combobox", { name: "Frame rate" })
    ).toHaveTextContent("60 fps");
  });

  it("floats on the popup tier with 28 px items", async () => {
    render(<FrameRateSelect open />);
    const list = await screen.findByRole("listbox");
    const popup = list.closest("[data-slot=select-content]");
    expect(popup).toHaveClass("glass-float", "border", "rounded-lg");
    expect(popup?.className).not.toMatch(/bg-popover|slide-in-from/u);
    expect(list).toHaveClass("overscroll-contain");
    expect(screen.getByRole("option", { name: "30 fps" })).toHaveClass(
      "min-h-7",
      "rounded-chip"
    );
  });

  it("keeps the wheel from reaching what sits behind the list", async () => {
    const behind = vi.fn();
    render(
      // oxlint-disable-next-line jsx-a11y/no-static-element-interactions -- A fader stand-in that listens for the wheel.
      <div onWheel={behind}>
        <FrameRateSelect open />
      </div>
    );
    fireEvent.wheel(await screen.findByRole("option", { name: "30 fps" }));
    expect(behind).not.toHaveBeenCalled();
  });
});
