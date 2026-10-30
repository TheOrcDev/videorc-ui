import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Button } from "@/components/ui/button";

describe("Button variants", () => {
  it("draws the regular and chromatic fills from the theme", () => {
    render(
      <>
        <Button variant="solid">Save scene</Button>
        <Button variant="chromatic">Go Live…</Button>
      </>
    );
    const solid = screen.getByRole("button", { name: "Save scene" });
    expect(solid).toHaveAttribute("data-variant", "solid");
    expect(solid).toHaveClass("bg-primary", "text-primary-foreground");
    // The chromatic ring is drawn in the border box, so it keeps the border.
    const chromatic = screen.getByRole("button", { name: "Go Live…" });
    expect(chromatic).toHaveClass("chrome-chromatic", "border");
    expect(chromatic).not.toHaveClass("border-0");
  });
});
