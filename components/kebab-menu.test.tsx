import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { KebabContextMenu } from "@/components/kebab-context-menu";
import { KebabMenu, kebabMenuGroups } from "@/components/kebab-menu";
import type { KebabMenuItem } from "@/components/kebab-menu";

// One ⋯ menu anatomy with groups, a busy state, keys, and a trigger that can
// wait for hover or focus.

const item = (
  id: string,
  extra: Partial<KebabMenuItem> = {}
): KebabMenuItem => ({
  id,
  label: id,
  onSelect: vi.fn(),
  ...extra,
});

describe("kebabMenuGroups", () => {
  it("groups by first appearance and puts destructive items last, on their own", () => {
    const groups = kebabMenuGroups([
      item("play", { group: "open" }),
      item("delete", { destructive: true }),
      item("rename", { group: "edit" }),
      item("markers", { group: "open" }),
      item("check", { group: "repair" }),
    ]);
    expect(groups.map((group) => group.map(({ id }) => id))).toEqual([
      ["play", "markers"],
      ["rename"],
      ["check"],
      ["delete"],
    ]);
  });

  it("keeps an ungrouped menu as one group, with Delete split off", () => {
    expect(
      kebabMenuGroups([
        item("rename"),
        item("delete", { destructive: true }),
        item("duplicate"),
      ])
    ).toEqual([
      [
        expect.objectContaining({ id: "rename" }),
        expect.objectContaining({ id: "duplicate" }),
      ],
      [expect.objectContaining({ id: "delete" })],
    ]);
  });
});

const trigger = () => screen.getByRole("button", { name: "Session actions" });

describe("KebabMenu", () => {
  it("shows a spinner and stays reachable while an item works", () => {
    render(<KebabMenu busy items={[item("play")]} label="Session actions" />);
    expect(trigger()).toHaveAttribute("aria-busy", "true");
    expect(trigger().querySelector(".animate-spin")).not.toBeNull();
    expect(trigger()).toBeEnabled();
  });

  it("waits for the host row to be hovered or focused when asked", () => {
    const { rerender } = render(
      <KebabMenu
        items={[item("play")]}
        label="Session actions"
        reveal="hover"
      />
    );
    expect(trigger()).toHaveClass(
      "opacity-0",
      "group-hover/kebab-host:opacity-100",
      "group-focus-within/kebab-host:opacity-100",
      "focus-visible:opacity-100",
      "data-popup-open:opacity-100"
    );
    rerender(<KebabMenu items={[item("play")]} label="Session actions" />);
    expect(trigger()).not.toHaveClass("opacity-0");
  });

  it("renders groups split by hairlines, keys on the right, and Delete last in red", async () => {
    const user = userEvent.setup();
    const items = [
      item("Play", { group: "open", shortcut: "␣" }),
      item("Rename", { group: "edit" }),
      item("Delete", { destructive: true }),
    ];
    render(<KebabMenu items={items} label="Session actions" />);
    await user.click(trigger());
    const menu = await screen.findByRole("menu");
    expect(trigger()).toHaveAttribute("data-popup-open");
    expect(within(menu).getAllByRole("group")).toHaveLength(3);
    expect(within(menu).getAllByRole("separator")).toHaveLength(2);
    expect(
      menu.querySelector("[data-slot=dropdown-menu-shortcut]")?.textContent
    ).toBe("␣");
    const rows = within(menu).getAllByRole("menuitem");
    expect(rows.map((row) => row.textContent)).toEqual([
      "Play␣",
      "Rename",
      "Delete",
    ]);
    expect(rows.at(-1)).toHaveAttribute("data-variant", "destructive");
  });

  it("runs an item's onSelect, never a disabled one's, and keeps clicks off the row", async () => {
    const user = userEvent.setup();
    const rename = item("Rename…");
    const remove = item("Delete", {
      destructive: true,
      disabled: true,
      disabledReason: "Wait for the upload to finish.",
    });
    const openRow = vi.fn();
    render(
      // oxlint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events -- A clickable row stand-in.
      <div onClick={openRow}>
        <KebabMenu items={[rename, remove]} label="Session actions" />
      </div>
    );
    await user.click(trigger());
    const deleteItem = await screen.findByRole("menuitem", { name: "Delete" });
    expect(deleteItem).toHaveAttribute("aria-disabled", "true");
    expect(deleteItem).toHaveAccessibleDescription(
      "Wait for the upload to finish."
    );
    await user.click(deleteItem);
    expect(remove.onSelect).not.toHaveBeenCalled();
    await user.click(screen.getByRole("menuitem", { name: "Rename…" }));
    expect(rename.onSelect).toHaveBeenCalledOnce();
    expect(openRow).not.toHaveBeenCalled();
  });
});

describe("KebabContextMenu", () => {
  it("opens the same items from a right-click on the row", async () => {
    const user = userEvent.setup();
    const rename = item("Rename…", { group: "edit" });
    render(
      <KebabContextMenu items={[item("Delete", { destructive: true }), rename]}>
        <div data-testid="row">Launch demo</div>
      </KebabContextMenu>
    );
    const row = screen.getByTestId("row");
    expect(row).toHaveAttribute("data-slot", "context-menu-trigger");
    await user.pointer({ keys: "[MouseRight]", target: row });
    const menu = await screen.findByRole("menu");
    const rows = within(menu).getAllByRole("menuitem");
    expect(rows.map((entry) => entry.textContent)).toEqual([
      "Rename…",
      "Delete",
    ]);
    expect(within(menu).getAllByRole("separator")).toHaveLength(1);
    await user.click(rows[0] as HTMLElement);
    expect(rename.onSelect).toHaveBeenCalledOnce();
  });
});
