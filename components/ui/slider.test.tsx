import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Slider } from "@/components/ui/slider";

// The name once sat on the slider's root, so every thumb (the element with
// role="slider") was read without one, and the player's scrubber announced
// raw milliseconds.

// Edge-aligned thumbs stay `visibility: hidden` until Base UI measures the
// control, which jsdom never lays out. Testing Library computes no name for a
// hidden element, so these helpers read the ARIA attributes themselves.
const thumbs = (): HTMLElement[] =>
  screen.getAllByRole("slider", { hidden: true });

const thumb = (): HTMLElement => {
  const [first] = thumbs();
  if (!first) {
    throw new Error("No slider thumb");
  }
  return first;
};

const textOf = (ids: string | null): string =>
  (ids ?? "")
    .split(" ")
    .map((id) => document.querySelector(`#${CSS.escape(id)}`)?.textContent)
    .join(" ");

/** The name a screen reader reads for `element`, from whatever names it. */
const nameOf = (element: Element): string =>
  element.hasAttribute("aria-labelledby")
    ? textOf(element.getAttribute("aria-labelledby"))
    : (element.getAttribute("aria-label") ?? "");

const root = (container: HTMLElement): HTMLElement => {
  const element = container.querySelector<HTMLElement>('[data-slot="slider"]');
  if (!element) {
    throw new Error("No slider root");
  }
  return element;
};

describe("Slider names its thumbs", () => {
  it("puts aria-label and aria-valuetext on the thumb, not the root", () => {
    const { container } = render(
      <Slider
        aria-label="Playhead"
        aria-valuetext="2:05 of 41:10"
        max={2_470_000}
        value={125_000}
      />
    );
    expect(nameOf(thumb())).toBe("Playhead");
    expect(thumb()).toHaveAttribute("aria-valuetext", "2:05 of 41:10");
    expect(root(container)).not.toHaveAttribute("aria-label");
    expect(root(container)).not.toHaveAttribute("aria-valuetext");
  });

  it("forwards aria-labelledby to the thumb", () => {
    const { container } = render(
      <>
        <span id="gain-label">Microphone gain</span>
        <Slider aria-labelledby="gain-label" value={3} />
      </>
    );
    expect(thumb()).toHaveAttribute("aria-labelledby", "gain-label");
    expect(nameOf(thumb())).toBe("Microphone gain");
    expect(root(container)).not.toHaveAttribute("aria-labelledby");
  });

  it("takes its Field's label when it names nothing, and keeps its own when it does", () => {
    const { container, rerender } = render(
      <Field>
        <FieldLabel>Motion</FieldLabel>
        <Slider max={1} step={0.05} value={0.45} />
      </Field>
    );
    const label = container.querySelector<HTMLLabelElement>(
      '[data-slot="field-label"]'
    );
    expect(thumb()).toHaveAttribute("aria-labelledby", label?.id);
    expect(nameOf(thumb())).toBe("Motion");
    // A label element cannot point at a thumb, so it points at nothing.
    expect(label).not.toHaveAttribute("for");

    rerender(
      <Field>
        <FieldLabel>Answers</FieldLabel>
        <Slider aria-label="Answers cooldown" value={20} />
      </Field>
    );
    expect(thumb()).toHaveAttribute("aria-label", "Answers cooldown");
    expect(thumb()).not.toHaveAttribute("aria-labelledby");
  });

  it("is described by its Field's description", () => {
    render(
      <Field>
        <FieldLabel>Bitrate</FieldLabel>
        <Slider max={12_000} min={2500} step={500} value={6000} />
        <FieldDescription>Twitch accepts up to 6,000 kbps.</FieldDescription>
      </Field>
    );
    expect(textOf(thumb().getAttribute("aria-describedby"))).toBe(
      "Twitch accepts up to 6,000 kbps."
    );
  });

  it("draws one thumb for a scalar", () => {
    render(<Slider aria-label="Gain" defaultValue={40} />);
    expect(thumbs()).toHaveLength(1);
    expect(thumb()).toHaveValue("40");
  });

  it("draws one thumb per value for a range, with Base UI's value text", () => {
    render(<Slider aria-label="Bitrate range" defaultValue={[2, 8]} />);
    expect(
      thumbs().map((element) => element.getAttribute("aria-valuetext"))
    ).toEqual(["2 start range", "8 end range"]);
  });
});

describe("Slider wears the chrome", () => {
  it("fills the range with chrome and draws each thumb as a chrome bead", () => {
    const { container } = render(<Slider aria-label="Gain" value={50} />);
    expect(container.querySelector('[data-slot="slider-range"]')).toHaveClass(
      "chrome-fill"
    );
    expect(container.querySelector('[data-slot="slider-thumb"]')).toHaveClass(
      "chrome-bead",
      "ring-1",
      "ring-knob-ring"
    );
  });
});
