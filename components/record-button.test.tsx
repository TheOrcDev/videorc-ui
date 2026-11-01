import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { RecordIcon, StopIcon } from "@/components/icons";
import { RECORD_BUTTON_LABELS, RecordButton } from "@/components/record-button";

// Record and its stop button, as one control.

/** The path an icon draws, to tell the record dot from the stop square. */
const glyphOf = (element: Element | null): string | null | undefined =>
  element?.querySelector("svg path")?.getAttribute("d");

/** Every state's glyph and words, stacked in the button's one cell. */
const layersOf = (button: HTMLElement): HTMLElement[] => [
  ...button.querySelectorAll<HTMLElement>(":scope > span > span"),
];

/** The layer the current state shows. */
const shownOf = (button: HTMLElement): HTMLElement | null =>
  layersOf(button).find((layer) => !layer.hasAttribute("aria-hidden")) ?? null;

const pathOf = (Icon: typeof RecordIcon): string | null | undefined => {
  const { container, unmount } = render(<Icon weight="fill" />);
  const path = glyphOf(container);
  unmount();
  return path;
};

describe("RecordButton", () => {
  it("can tell its two glyphs apart", () => {
    expect(pathOf(RecordIcon)).toBeTruthy();
    expect(pathOf(RecordIcon)).not.toBe(pathOf(StopIcon));
  });

  it("is the unlit record LED at idle, and starts the session on a click", () => {
    const onClick = vi.fn();
    render(<RecordButton onClick={onClick} />);
    const button = screen.getByRole("button", { name: "Record" });
    expect(button).toHaveAttribute("data-slot", "button");
    expect(button).toHaveAttribute("data-variant", "record");
    expect(button).toHaveClass("chrome-led");
    expect(button).toHaveAttribute("data-state", "idle");
    expect(button).not.toHaveAttribute("data-lit");
    expect(button).not.toHaveAttribute("aria-pressed");
    expect(glyphOf(shownOf(button))).toBe(pathOf(RecordIcon));
    fireEvent.click(button);
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("lights and stops the session while it runs", () => {
    const onClick = vi.fn();
    render(<RecordButton onClick={onClick} state="running" />);
    const button = screen.getByRole("button", { name: "Stop recording" });
    expect(button).toHaveAttribute("data-lit");
    expect(button).toHaveAttribute("data-state", "running");
    expect(button).toBeEnabled();
    expect(glyphOf(shownOf(button))).toBe(pathOf(StopIcon));
    fireEvent.click(button);
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("says the caller's words, such as a livestream's", () => {
    render(
      <RecordButton labels={{ running: "End livestream" }} state="running" />
    );
    expect(
      screen.getByRole("button", { name: "End livestream" })
    ).toHaveAttribute("data-lit");
  });

  it("lays out every state's words, so its width never changes", () => {
    render(
      <RecordButton labels={{ running: "End livestream" }} state="idle" />
    );
    const button = screen.getByRole("button", { name: "Record" });
    const layers = layersOf(button);
    expect(layers.map((layer) => layer.textContent)).toEqual([
      "Record",
      "Record",
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
    ["starting", "Record", RecordIcon],
    ["stopping", "Stopping…", StopIcon],
  ] as const)(
    "while %s, stays lit and focusable but takes no click",
    (state, name, icon) => {
      const onClick = vi.fn();
      render(<RecordButton onClick={onClick} state={state} />);
      const button = screen.getByRole("button", { name });
      expect(button).toHaveAttribute("data-lit");
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

  it("is a disabled button when a start is blocked", () => {
    render(<RecordButton disabled />);
    const button = screen.getByRole("button", { name: "Record" });
    expect(button).toBeDisabled();
    expect(button).not.toHaveAttribute("data-lit");
  });

  it("passes Button's props through", () => {
    render(<RecordButton className="flex-1" data-testid="record" size="lg" />);
    const button = screen.getByTestId("record");
    expect(button).toHaveClass("flex-1");
    expect(button).toHaveAttribute("data-size", "lg");
  });

  it("names each state in the design's words", () => {
    expect(RECORD_BUTTON_LABELS).toEqual({
      idle: "Record",
      running: "Stop recording",
      starting: "Record",
      stopping: "Stopping…",
    });
  });
});
