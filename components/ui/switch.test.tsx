import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Field, FieldLabel } from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";

describe("Switch", () => {
  it("toggles from its FieldLabel", () => {
    const onCheckedChange = vi.fn();
    render(
      <Field orientation="horizontal">
        <FieldLabel>Save local recording</FieldLabel>
        <Switch onCheckedChange={onCheckedChange} />
      </Field>
    );
    fireEvent.click(screen.getByText("Save local recording"));
    expect(onCheckedChange).toHaveBeenCalledWith(true, expect.anything());
    expect(
      screen.getByRole("switch", { name: "Save local recording" })
    ).toBeChecked();
  });

  it("draws the knob as a chrome bead, the inverse bead on its chrome track", () => {
    const { container } = render(<Switch aria-label="Made for kids" checked />);
    const track = container.querySelector('[data-slot="switch"]');
    const knob = container.querySelector('[data-slot="switch-thumb"]');
    expect(track).toHaveAttribute("data-checked");
    expect(track).toHaveClass("data-checked:chrome-fill");
    expect(knob).toHaveClass(
      "chrome-bead",
      "ring-1",
      "ring-knob-ring",
      "data-checked:chrome-bead-ink"
    );
    // The chrome replaces every flat fill, and the motion is a quick slide.
    expect(track?.className).not.toMatch(/bg-primary|transition-all/u);
    expect(knob?.className).not.toMatch(/bg-knob|bg-background|shadow-sm/u);
  });

  it("marks its size for the track and knob", () => {
    const { container } = render(
      <Switch aria-label="Show on stream" size="sm" />
    );
    expect(container.querySelector('[data-slot="switch"]')).toHaveAttribute(
      "data-size",
      "sm"
    );
  });
});
