import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import {
  GO_LIVE_BUTTON_LABELS,
  GoLiveButton,
} from "@/components/go-live-button";
import { LivestreamIcon, StopIcon } from "@/components/icons";

// Go Live and its End livestream, as one control.

/** The path an icon draws, to tell the broadcast glyph from the stop square. */
const glyphOf = (element: Element | null): string | null | undefined =>
  element?.querySelector("svg path")?.getAttribute("d");

/** Every state's glyph and words, stacked in the button's one cell. */
const layersOf = (button: HTMLElement): HTMLElement[] => [
  ...button.querySelectorAll<HTMLElement>(":scope > span > span"),
];

/** The layer the current state shows. */
const shownOf = (button: HTMLElement): HTMLElement | null =>
  layersOf(button).find((layer) => !layer.hasAttribute("aria-hidden")) ?? null;

const pathOf = (Icon: typeof LivestreamIcon): string | null | undefined => {
  const { container, unmount } = render(<Icon weight="fill" />);
  const path = glyphOf(container);
  unmount();
  return path;
};

describe("GoLiveButton", () => {
  it("can tell its two glyphs apart", () => {
    expect(pathOf(LivestreamIcon)).toBeTruthy();
    expect(pathOf(LivestreamIcon)).not.toBe(pathOf(StopIcon));
  });

  it("is copper at idle, and goes live on a click", () => {
    const onClick = vi.fn();
    render(<GoLiveButton onClick={onClick} />);
    const button = screen.getByRole("button", { name: "Go Live" });
    expect(button).toHaveAttribute("data-slot", "button");
    expect(button).toHaveAttribute("data-variant", "go-live");
    expect(button).toHaveClass("chrome-copper");
    expect(button).toHaveAttribute("data-state", "idle");
    expect(button).not.toHaveAttribute("aria-pressed");
    expect(glyphOf(shownOf(button))).toBe(pathOf(LivestreamIcon));
    fireEvent.click(button);
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("ends the livestream while it's live", () => {
    const onClick = vi.fn();
    render(<GoLiveButton onClick={onClick} state="live" />);
    const button = screen.getByRole("button", { name: "End livestream" });
    expect(button).toHaveAttribute("data-state", "live");
    expect(button).toBeEnabled();
    expect(glyphOf(shownOf(button))).toBe(pathOf(StopIcon));
    fireEvent.click(button);
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("says the caller's words", () => {
    render(<GoLiveButton labels={{ idle: "Go Live…" }} />);
    expect(screen.getByRole("button", { name: "Go Live…" })).toBeEnabled();
  });

  it("lays out every state's words, so its width never changes", () => {
    render(<GoLiveButton />);
    const button = screen.getByRole("button", { name: "Go Live" });
    const layers = layersOf(button);
    expect(layers.map((layer) => layer.textContent)).toEqual([
      "Go Live",
      "Checking…",
      "End livestream",
      "Stopping…",
    ]);
    // Only the current state's layer shows, and only it names the button.
    const hidden = layers.filter((layer) => layer !== shownOf(button));
    expect(hidden).toHaveLength(3);
    for (const layer of hidden) {
      expect(layer).toHaveAttribute("aria-hidden", "true");
      expect(layer).toHaveClass("invisible");
    }
    expect(shownOf(button)).not.toHaveClass("invisible");
  });

  it.each([
    ["checking", "Checking…", LivestreamIcon],
    ["stopping", "Stopping…", StopIcon],
  ] as const)(
    "while %s, stays copper and focusable but takes no click",
    (state, name, icon) => {
      const onClick = vi.fn();
      render(<GoLiveButton onClick={onClick} state={state} />);
      const button = screen.getByRole("button", { name });
      expect(button).toHaveAttribute("data-state", state);
      // aria-disabled, not the native attribute, so nothing dims and focus stays.
      expect(button).toHaveAttribute("aria-disabled", "true");
      expect(button).not.toHaveAttribute("disabled");
      button.focus();
      expect(button).toHaveFocus();
      expect(glyphOf(shownOf(button))).toBe(pathOf(icon));
      fireEvent.click(button);
      expect(onClick).not.toHaveBeenCalled();
    }
  );

  it("is a disabled button when going live is blocked", () => {
    render(<GoLiveButton disabled />);
    expect(screen.getByRole("button", { name: "Go Live" })).toBeDisabled();
  });

  it("passes Button's props through", () => {
    render(<GoLiveButton className="flex-1" data-testid="go-live" size="lg" />);
    const button = screen.getByTestId("go-live");
    expect(button).toHaveClass("flex-1");
    expect(button).toHaveAttribute("data-size", "lg");
  });

  it("names each state in Videorc's words", () => {
    expect(GO_LIVE_BUTTON_LABELS).toEqual({
      checking: "Checking…",
      idle: "Go Live",
      live: "End livestream",
      stopping: "Stopping…",
    });
  });
});
