import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import {
  PIN_WINDOW_LABEL,
  PinWindowButton,
} from "@/components/pin-window-button";

// One Keep on top control, in every window.

describe("PinWindowButton", () => {
  it("has one name in every window, and says whether the window is kept on top", () => {
    expect(PIN_WINDOW_LABEL).toBe("Keep on top");
    const { rerender } = render(
      <PinWindowButton onPinnedChange={vi.fn()} pinned={false} />
    );
    const button = screen.getByTestId("pin-window-button");
    expect(button).toHaveAttribute("aria-label", "Keep on top");
    expect(button).toHaveAttribute("aria-pressed", "false");
    expect(button.className).toContain("[-webkit-app-region:no-drag]");
    expect(button).toHaveAttribute("data-variant", "ghost");
    rerender(<PinWindowButton onPinnedChange={vi.fn()} pinned />);
    expect(screen.getByTestId("pin-window-button")).toHaveAttribute(
      "aria-pressed",
      "true"
    );
  });

  it("asks for the other state on a click", () => {
    const onPinnedChange = vi.fn();
    render(<PinWindowButton onPinnedChange={onPinnedChange} pinned={false} />);
    fireEvent.click(screen.getByTestId("pin-window-button"));
    expect(onPinnedChange).toHaveBeenCalledWith(true);
  });

  it("becomes a status-bar action where the title row stays bare (Stream Manager)", () => {
    const onPinnedChange = vi.fn();
    render(
      <PinWindowButton
        onPinnedChange={onPinnedChange}
        pinned
        variant="status-bar"
      />
    );
    const button = screen.getByTestId("pin-window-button");
    expect(button).toHaveAttribute("data-slot", "status-bar-action");
    expect(button).toHaveAttribute("aria-label", "Keep on top");
    expect(button).toHaveAttribute("aria-pressed", "true");
    // The tooltip names it; no second, native hover text.
    expect(button).not.toHaveAttribute("title");
    fireEvent.click(button);
    expect(onPinnedChange).toHaveBeenCalledWith(false);
  });
});
