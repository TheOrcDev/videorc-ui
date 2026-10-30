import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const RecordingMenu = () => (
  <DropdownMenu defaultOpen>
    <DropdownMenuTrigger>More actions</DropdownMenuTrigger>
    <DropdownMenuContent>
      <DropdownMenuLabel>Recording</DropdownMenuLabel>
      <DropdownMenuGroup>
        <DropdownMenuLabel>Edit</DropdownMenuLabel>
        <DropdownMenuItem>Rename…</DropdownMenuItem>
      </DropdownMenuGroup>
      <DropdownMenuSeparator />
      <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);

describe("DropdownMenu", () => {
  it("floats on the popup tier, fading and scaling from 0.98", async () => {
    render(<RecordingMenu />);
    const menu = await screen.findByRole("menu");
    expect(menu).toHaveClass(
      "glass-float",
      "border",
      "rounded-lg",
      "overscroll-contain",
      "data-open:zoom-in-[0.98]",
      "duration-100"
    );
    expect(menu.className).not.toMatch(
      /bg-popover|rounded-(?:2xl|3xl)|slide-in-from|zoom-(?:in|out)-95/u
    );
  });

  it("sizes items at 28 px with a 6 px radius, and one hairline separator", async () => {
    render(<RecordingMenu />);
    const item = await screen.findByRole("menuitem", { name: "Rename…" });
    expect(item).toHaveClass("min-h-7", "rounded-chip");
    expect(screen.getByRole("separator")).toHaveClass("bg-border");
    expect(screen.getByRole("separator").className).not.toContain(
      "bg-border/50"
    );
  });

  it("takes a label outside any group as a heading, and one inside as the group's name", async () => {
    render(<RecordingMenu />);
    expect(await screen.findByText("Recording")).toHaveAttribute(
      "data-slot",
      "dropdown-menu-label"
    );
    expect(screen.getByRole("group", { name: "Edit" })).toBeInTheDocument();
  });

  it("keeps the wheel from reaching what sits behind the menu", async () => {
    const behind = vi.fn();
    render(
      // oxlint-disable-next-line jsx-a11y/no-static-element-interactions -- A fader stand-in that listens for the wheel.
      <div onWheel={behind}>
        <RecordingMenu />
      </div>
    );
    fireEvent.wheel(await screen.findByRole("menuitem", { name: "Rename…" }));
    expect(behind).not.toHaveBeenCalled();
  });
});
