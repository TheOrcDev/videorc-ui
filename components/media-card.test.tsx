import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { MediaCard } from "@/components/media-card";

// One card recipe for objects with a picture.

describe("MediaCard", () => {
  it("is the card recipe: 8 px radius, a 4% fill, a hairline and no shadow", () => {
    render(<MediaCard>Screen + camera</MediaCard>);
    const card = screen.getByText("Screen + camera");
    expect(card).toHaveAttribute("data-slot", "media-card");
    expect(card).toHaveClass("rounded-row", "border-border", "bg-foreground/4");
    expect(card.className).not.toMatch(
      /shadow|rounded-panel|bg-muted|bg-card/u
    );
    expect(card).not.toHaveAttribute("data-selected");
  });

  it("marks the one in use with a brighter rim on the chrome plate, never a color", () => {
    render(<MediaCard selected>Screen + camera</MediaCard>);
    const card = screen.getByText("Screen + camera");
    expect(card).toHaveAttribute("data-selected", "true");
    expect(card).toHaveClass("chrome-plate", "border-foreground/25");
    expect(card.className).not.toMatch(/primary|success|warning/u);
  });

  it("puts the look on another element, so a card can be a button", () => {
    render(
      <MediaCard
        interactive
        // oxlint-disable-next-line jsx-a11y/control-has-associated-label -- Base UI renders the label into it.
        render={<button type="button" />}
        selected
      >
        Screen + camera
      </MediaCard>
    );
    const card = screen.getByRole("button", { name: "Screen + camera" });
    expect(card).toHaveClass("rounded-row", "hover:bg-accent");
    expect(card).toHaveAttribute("data-slot", "media-card");
    expect(card).toHaveAttribute("data-selected", "true");
  });
});
