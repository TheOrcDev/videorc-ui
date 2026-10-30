import { render, screen } from "@testing-library/react";
import { beforeAll, describe, expect, it, vi } from "vitest";

import {
  Command,
  CommandDialog,
  CommandFooter,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

// cmdk scrolls the selected row into view; jsdom has no layout to scroll.
beforeAll(() => {
  Element.prototype.scrollIntoView ??= () => {};
});

describe("CommandDialog", () => {
  it("wraps its children in Command, so the cmdk parts find their store", async () => {
    render(
      <CommandDialog defaultOpen value="studio">
        <CommandInput placeholder="Search…" />
        <CommandList>
          <CommandGroup heading="Pages">
            <CommandItem value="studio">Studio</CommandItem>
            <CommandItem value="sources">Sources</CommandItem>
          </CommandGroup>
        </CommandList>
        <CommandFooter>Open Studio</CommandFooter>
      </CommandDialog>
    );
    const dialog = await screen.findByRole("dialog", { name: "Search" });
    const command = dialog.querySelector("[data-slot=command]");
    expect(command).toContainElement(screen.getByRole("combobox"));
    expect(command).toContainElement(screen.getByText("Open Studio"));
    // The palette is the dialog's surface: Command paints no coat of its own.
    expect(command?.className).not.toMatch(/\bbg-/u);
  });

  it("highlights only the selected row", async () => {
    render(
      <CommandDialog defaultOpen value="sources">
        <CommandList>
          <CommandItem value="studio">Studio</CommandItem>
          <CommandItem value="sources">Sources</CommandItem>
        </CommandList>
      </CommandDialog>
    );
    const selected = await screen.findByRole("option", { name: "Sources" });
    expect(selected).toHaveAttribute("data-selected", "true");
    expect(screen.getByRole("option", { name: "Studio" })).toHaveAttribute(
      "data-selected",
      "false"
    );
    expect(selected).toHaveClass("data-[selected=true]:bg-accent", "min-h-10");
  });
});

describe("Command scrolling", () => {
  it("scrolls its own list, never the page, to the selected row", () => {
    const pageScroll = vi.spyOn(Element.prototype, "scrollIntoView");
    render(
      <Command>
        <CommandList>
          <CommandGroup heading="Session">
            <CommandItem>Start recording</CommandItem>
            <CommandItem>Go Live…</CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    );
    const [first] = screen.getAllByRole("option");
    first?.scrollIntoView();
    expect(pageScroll).not.toHaveBeenCalled();
    pageScroll.mockRestore();
  });
});
