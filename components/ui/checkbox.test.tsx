import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldLabel } from "@/components/ui/field";

describe("Checkbox", () => {
  it("toggles from its FieldLabel", () => {
    render(
      <Field orientation="horizontal">
        <Checkbox />
        <FieldLabel>Include markers</FieldLabel>
      </Field>
    );
    const checkbox = screen.getByRole("checkbox", { name: "Include markers" });
    expect(checkbox).not.toBeChecked();
    fireEvent.click(screen.getByText("Include markers"));
    expect(checkbox).toBeChecked();
  });

  it("fills with chrome when checked or mixed, never the primary colour", () => {
    const { container } = render(<Checkbox aria-label="Select all" checked />);
    const box = container.querySelector('[data-slot="checkbox"]');
    expect(box).toHaveClass("not-data-unchecked:chrome-fill");
    expect(box?.className).not.toMatch(/bg-primary/u);
  });

  it("draws a dash instead of the check while indeterminate", () => {
    const { container } = render(
      <Checkbox aria-label="Select all recordings" indeterminate />
    );
    expect(
      screen.getByRole("checkbox", { name: "Select all recordings" })
    ).toHaveAttribute("aria-checked", "mixed");
    const box = container.querySelector('[data-slot="checkbox"]');
    expect(box).toHaveAttribute("data-indeterminate");
    expect(box).not.toHaveAttribute("data-unchecked");
    expect(
      container.querySelector('[data-slot="checkbox-indicator"] svg')
    ).toHaveClass("group-data-indeterminate/checkbox:hidden");
  });
});
