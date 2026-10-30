import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import {
  Fader,
  FaderRange,
  FaderReset,
  FaderThumb,
  FaderTrack,
  FaderValue,
} from "@/components/ui/fader";

// Ported from audiocn's controls tests; the paint checks are Videorc's.

const faderInput = () => screen.getByRole("slider");

const part = (container: HTMLElement, slot: string): HTMLElement => {
  const element = container.querySelector<HTMLElement>(`[data-slot="${slot}"]`);
  if (!element) {
    throw new Error(`No ${slot}`);
  }
  return element;
};

describe("Fader", () => {
  it("reports its value in dB to assistive technology", () => {
    render(<Fader aria-label="Mic" defaultValue={-6} />);
    expect(faderInput()).toHaveAttribute("aria-valuetext", "−6.0 dB");
    expect(faderInput()).toHaveAccessibleName("Mic");
  });

  it("steps by step, largeStep and fineStep", () => {
    const onValueChange = vi.fn();
    render(<Fader defaultValue={0} onValueChange={onValueChange} />);
    fireEvent.keyDown(faderInput(), { key: "ArrowDown" });
    expect(onValueChange).toHaveBeenLastCalledWith(-0.5, expect.anything());
    fireEvent.keyDown(faderInput(), { key: "ArrowDown", shiftKey: true });
    expect(onValueChange).toHaveBeenLastCalledWith(-6.5, expect.anything());
    fireEvent.keyDown(faderInput(), { altKey: true, key: "ArrowUp" });
    expect(onValueChange).toHaveBeenLastCalledWith(-6.4, expect.anything());
  });

  it("jumps to the ends with Home and End, and to silence when allowed", () => {
    const onValueChange = vi.fn();
    render(
      <Fader defaultValue={0} onValueChange={onValueChange} silenceAtMin />
    );
    fireEvent.keyDown(faderInput(), { key: "End" });
    expect(onValueChange).toHaveBeenLastCalledWith(6, expect.anything());
    fireEvent.keyDown(faderInput(), { key: "Home" });
    expect(onValueChange).toHaveBeenLastCalledWith(
      Number.NEGATIVE_INFINITY,
      expect.anything()
    );
    expect(faderInput()).toHaveAttribute("aria-valuetext", "Silent");
  });

  it("stays put when controlled without an update", () => {
    render(<Fader onValueChange={vi.fn()} value={-12} />);
    fireEvent.keyDown(faderInput(), { key: "ArrowUp" });
    expect(faderInput()).toHaveAttribute("aria-valuetext", "−12.0 dB");
  });

  it("commits keyboard changes", () => {
    const onValueCommitted = vi.fn();
    render(<Fader defaultValue={-3} onValueCommitted={onValueCommitted} />);
    fireEvent.keyDown(faderInput(), { key: "PageUp" });
    expect(onValueCommitted).toHaveBeenCalledWith(3);
  });
});

const renderParts = (variant: "default" | "console") =>
  render(
    <Fader aria-label="Microphone" defaultValue={-6} variant={variant}>
      <FaderReset />
      <FaderValue editable />
      <FaderTrack>
        <FaderRange />
        <FaderThumb />
      </FaderTrack>
    </Fader>
  );

describe("Fader wears Liquid Chrome", () => {
  it("fills the range with chrome and makes the thumb a bead", () => {
    const { container } = renderParts("default");
    expect(part(container, "fader-range")).toHaveClass("chrome-fill");
    expect(part(container, "fader-range")).not.toHaveClass("bg-primary");
    const thumb = part(container, "fader-thumb");
    expect(thumb).toHaveClass("chrome-bead", "ring-knob-ring", "rounded-full");
    expect(thumb).not.toHaveClass("bg-background");
  });

  it("keeps the console cap on a chip radius", () => {
    const { container } = renderParts("console");
    const thumb = part(container, "fader-thumb");
    expect(thumb).toHaveClass("rounded-chip", "bg-background");
    expect(thumb).not.toHaveClass("chrome-bead");
  });

  it("puts the value and Reset on the row radius", () => {
    const { container } = renderParts("default");
    expect(part(container, "fader-value")).toHaveClass("rounded-row");
    expect(part(container, "fader-reset")).toHaveClass("rounded-row");
  });
});
