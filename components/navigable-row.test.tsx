import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { MicrophoneIcon } from "@/components/icons";
import {
  NavigableRow,
  NavigableRowHintLines,
} from "@/components/navigable-row";

describe("NavigableRow", () => {
  it("is a fact with no chevron when nothing owns the value elsewhere", () => {
    const { container } = render(
      <NavigableRow icon={MicrophoneIcon} label="Microphone" value="Off" />
    );
    expect(screen.queryByRole("button")).toBeNull();
    const row = container.querySelector("[data-slot=navigable-row]");
    expect(row?.tagName).toBe("DIV");
    expect(row?.className).toContain("h-row");
    expect(row?.className).toContain(
      "in-data-[slot=grouped-list]:rounded-none"
    );
    // The icon and the value, with no chevron: only a row that navigates has one.
    expect(row?.querySelectorAll("svg")).toHaveLength(1);
  });

  it("jumps to the value's home as one button with a chevron", () => {
    const onNavigate = vi.fn();
    render(
      <NavigableRow
        label="Output"
        onNavigate={onNavigate}
        value="1080p · 60 fps"
      />
    );
    const row = screen.getByRole("button", { name: /Output/u });
    expect(row).toHaveAttribute("data-slot", "navigable-row");
    expect(row).toHaveAttribute("type", "button");
    expect(row.querySelector("svg")).not.toBeNull();
    fireEvent.click(row);
    expect(onNavigate).toHaveBeenCalledTimes(1);
  });

  it("keeps the row's own slot when a hint makes it a tooltip trigger", () => {
    render(
      <NavigableRow
        hint={<NavigableRowHintLines lines={["YouTube", "Twitch"]} />}
        label="Destinations"
        onNavigate={vi.fn()}
        value="2 on"
      />
    );
    const row = screen.getByRole("button", { name: /Destinations/u });
    expect(row).toHaveAttribute("data-slot", "navigable-row");
    expect(row).not.toHaveAttribute("title");
  });
});

describe("NavigableRowHintLines", () => {
  it("lays out one fact per line, repeats included", () => {
    const { container } = render(
      <NavigableRowHintLines lines={["1080p", "1080p", "60 fps"]} />
    );
    const hint = container.querySelector("[data-slot=navigable-row-hint]");
    expect(hint?.className).toContain("flex-col");
    expect(hint?.children).toHaveLength(3);
  });
});
