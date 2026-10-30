import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";

describe("Popover", () => {
  it("floats on the popup tier, fading and scaling from 0.98", async () => {
    render(
      <Popover defaultOpen>
        <PopoverTrigger>Sounds</PopoverTrigger>
        <PopoverContent>
          <PopoverTitle>Sound board</PopoverTitle>
        </PopoverContent>
      </Popover>
    );
    const popup = await screen.findByRole("dialog", { name: "Sound board" });
    expect(popup).toHaveClass(
      "glass-float",
      "border",
      "rounded-lg",
      "data-open:zoom-in-[0.98]",
      "duration-100"
    );
    expect(popup.className).not.toMatch(
      /bg-popover|rounded-(?:2xl|3xl)|slide-in-from|zoom-(?:in|out)-95/u
    );
  });

  it("keeps the Anchor part, which takes over from the trigger", async () => {
    render(
      <Popover defaultOpen>
        <PopoverAnchor data-testid="status-bar">
          <PopoverTrigger>Sounds</PopoverTrigger>
        </PopoverAnchor>
        <PopoverContent>
          <PopoverTitle>Sound board</PopoverTitle>
        </PopoverContent>
      </Popover>
    );
    expect(screen.getByTestId("status-bar")).toHaveAttribute(
      "data-slot",
      "popover-anchor"
    );
    expect(
      await screen.findByRole("dialog", { name: "Sound board" })
    ).toBeInTheDocument();
  });
});

describe("HoverCard", () => {
  it("floats on the popup tier, fading and scaling from 0.98", async () => {
    render(
      <HoverCard defaultOpen>
        <HoverCardTrigger href="https://twitch.tv">Twitch</HoverCardTrigger>
        <HoverCardContent>Live now</HoverCardContent>
      </HoverCard>
    );
    const card = await screen.findByText("Live now");
    expect(card).toHaveClass(
      "glass-float",
      "border",
      "rounded-lg",
      "data-open:zoom-in-[0.98]",
      "duration-100"
    );
    expect(card.className).not.toMatch(/bg-popover|slide-in-from/u);
  });
});
