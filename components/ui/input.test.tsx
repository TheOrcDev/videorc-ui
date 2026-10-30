import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

// One desktop scale, retuned once in components/ui.
describe("Input on the desktop scale", () => {
  it("is the 28 px control height on the chip radius", () => {
    const { container } = render(<Input aria-label="Stream title" />);
    expect(container.querySelector("input")).toHaveClass(
      "h-control",
      "rounded-chip"
    );
  });

  it("sets inputs and text areas at 14 px at every width, never the mobile 16 px", () => {
    const { container } = render(
      <>
        <Input aria-label="Stream title" />
        <Textarea aria-label="Description" />
      </>
    );
    for (const element of container.querySelectorAll("input, textarea")) {
      expect(element).toHaveClass("text-sm");
      expect(element.className).not.toMatch(/text-base|md:text-/u);
    }
  });
});
