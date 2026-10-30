import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Button } from "@/components/ui/button";

describe("Button variants", () => {
  it("draws the regular, chromatic and glitch fills from the theme", () => {
    render(
      <>
        <Button variant="solid">Save scene</Button>
        <Button variant="chromatic">Go Live…</Button>
        <Button variant="glitch">On air</Button>
      </>
    );
    const solid = screen.getByRole("button", { name: "Save scene" });
    expect(solid).toHaveAttribute("data-variant", "solid");
    expect(solid).toHaveClass("bg-primary", "text-primary-foreground");
    expect(screen.getByRole("button", { name: "Go Live…" })).toHaveClass(
      "chrome-chromatic",
      "border-0"
    );
    expect(screen.getByRole("button", { name: "On air" })).toHaveClass(
      "signal-glitch",
      "border-0"
    );
  });
});
