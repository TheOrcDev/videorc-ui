import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";

const MessageMenu = () => (
  <ContextMenu>
    <ContextMenuTrigger>A chat message</ContextMenuTrigger>
    <ContextMenuContent>
      <ContextMenuLabel>From @orcdev</ContextMenuLabel>
      <ContextMenuItem>Copy message</ContextMenuItem>
      <ContextMenuItem variant="destructive">Remove message</ContextMenuItem>
    </ContextMenuContent>
  </ContextMenu>
);

const open = async () => {
  fireEvent.contextMenu(screen.getByText("A chat message"));
  return await screen.findByRole("menu");
};

describe("ContextMenu", () => {
  it("opens on the popup tier with 28 px items, a heading label and all", async () => {
    render(<MessageMenu />);
    const menu = await open();
    expect(menu).toHaveClass(
      "glass-float",
      "border",
      "rounded-lg",
      "overscroll-contain"
    );
    expect(screen.getByText("From @orcdev")).toHaveAttribute(
      "data-slot",
      "context-menu-label"
    );
    expect(
      screen.getByRole("menuitem", { name: "Remove message" })
    ).toHaveClass("min-h-7", "rounded-chip");
  });

  it("keeps the wheel from reaching what sits behind the menu", async () => {
    const behind = vi.fn();
    render(
      // oxlint-disable-next-line jsx-a11y/no-static-element-interactions -- A scrolling pane stand-in that listens for the wheel.
      <div onWheel={behind}>
        <MessageMenu />
      </div>
    );
    fireEvent.wheel(await open());
    expect(behind).not.toHaveBeenCalled();
  });
});
