import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Toggle } from "@/components/ui/toggle";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

describe("Toggle", () => {
  it("draws pressed as the chrome plate, keyed off data-pressed", () => {
    render(
      <Toggle aria-label="Keep on top" defaultPressed>
        Pin
      </Toggle>
    );
    const toggle = screen.getByRole("button", { name: "Keep on top" });
    expect(toggle).toHaveAttribute("data-pressed");
    expect(toggle).toHaveAttribute("aria-pressed", "true");
    expect(toggle.className).toContain("data-pressed:chrome-plate");
    expect(toggle.className).toContain("h-control");
    expect(toggle.className).not.toMatch(/glass-chip|data-\[state=/u);
  });
});

describe("ToggleGroup", () => {
  it("takes an array of pressed values and reports the next array", () => {
    const onValueChange = vi.fn();
    render(
      <ToggleGroup
        aria-label="Chat filters"
        defaultValue={["questions"]}
        multiple
        onValueChange={onValueChange}
      >
        <ToggleGroupItem value="questions">Questions</ToggleGroupItem>
        <ToggleGroupItem value="mentions">Mentions</ToggleGroupItem>
      </ToggleGroup>
    );
    const questions = screen.getByRole("button", { name: "Questions" });
    expect(questions).toHaveAttribute("data-pressed");
    expect(questions.className).toContain("data-pressed:chrome-plate");
    fireEvent.click(screen.getByRole("button", { name: "Mentions" }));
    expect(onValueChange.mock.calls[0]?.[0]).toEqual(["questions", "mentions"]);
  });

  it("passes its variant, size and spacing to every item", () => {
    render(
      <ToggleGroup aria-label="Kinds of cuts" size="xs" spacing={0}>
        <ToggleGroupItem value="silences">Silences</ToggleGroupItem>
      </ToggleGroup>
    );
    const item = screen.getByRole("button", { name: "Silences" });
    expect(item).toHaveAttribute("data-size", "xs");
    expect(item).toHaveAttribute("data-spacing", "0");
    expect(item.className).toContain("h-6");
  });

  it("lays out and moves focus along its orientation", async () => {
    render(
      <ToggleGroup aria-label="Corner" orientation="vertical">
        <ToggleGroupItem value="top">Top</ToggleGroupItem>
        <ToggleGroupItem value="bottom">Bottom</ToggleGroupItem>
      </ToggleGroup>
    );
    const group = screen.getByRole("group", { name: "Corner" });
    expect(group).toHaveAttribute("data-orientation", "vertical");
    const top = screen.getByRole("button", { name: "Top" });
    top.focus();
    fireEvent.keyDown(top, { key: "ArrowDown" });
    // Base UI moves focus in a microtask.
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Bottom" })).toHaveFocus()
    );
  });
});
