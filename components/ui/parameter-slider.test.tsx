import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import {
  ParameterSlider,
  ParameterSliderControl,
  ParameterSliderHeader,
  ParameterSliderLabel,
  ParameterSliderReset,
} from "@/components/ui/parameter-slider";

// Ported from audiocn's controls tests; the paint check is Videorc's.

const part = (container: HTMLElement, slot: string): HTMLElement => {
  const element = container.querySelector<HTMLElement>(`[data-slot="${slot}"]`);
  if (!element) {
    throw new Error(`No ${slot}`);
  }
  return element;
};

describe("ParameterSlider", () => {
  it("steps within its range and labels the thumb", () => {
    const onValueChange = vi.fn();
    render(
      <ParameterSlider
        max={1000}
        min={-1000}
        onValueChange={onValueChange}
        step={5}
        unit="ms"
      >
        <ParameterSliderLabel>Sync</ParameterSliderLabel>
        <ParameterSliderControl />
      </ParameterSlider>
    );
    const thumb = screen.getByRole("slider", { name: "Sync" });
    fireEvent.keyDown(thumb, { key: "ArrowUp" });
    expect(onValueChange).toHaveBeenLastCalledWith(-995, expect.anything());
    fireEvent.keyDown(thumb, { key: "End" });
    expect(onValueChange).toHaveBeenLastCalledWith(1000, expect.anything());
  });

  it("steps from the parent's value after it rejected a change", () => {
    const onValueChange = vi.fn();
    const slider = (className: string) => (
      <ParameterSlider
        className={className}
        max={10}
        min={0}
        onValueChange={onValueChange}
        step={1}
        value={0}
      >
        <ParameterSliderControl />
      </ParameterSlider>
    );
    const { rerender } = render(slider("a"));
    fireEvent.keyDown(screen.getByRole("slider"), { key: "ArrowUp" });
    // An unrelated re-render; the parent still says 0.
    rerender(slider("b"));
    fireEvent.keyDown(screen.getByRole("slider"), { key: "ArrowUp" });
    const reported = onValueChange.mock.calls.map(([value]) => value);
    expect(reported).toContain(1);
    expect(reported).not.toContain(2);
  });

  it("wears Liquid Chrome: a chrome range, a bead thumb, Reset on the row radius", () => {
    const { container } = render(
      <ParameterSlider defaultValue={40} unit="%">
        <ParameterSliderHeader>
          <ParameterSliderLabel>Opacity</ParameterSliderLabel>
          <ParameterSliderReset />
        </ParameterSliderHeader>
        <ParameterSliderControl />
      </ParameterSlider>
    );
    expect(part(container, "parameter-slider-range")).toHaveClass(
      "chrome-fill"
    );
    const thumb = part(container, "parameter-slider-thumb");
    expect(thumb).toHaveClass("chrome-bead", "ring-knob-ring");
    expect(thumb).not.toHaveClass("bg-background");
    expect(part(container, "parameter-slider-reset")).toHaveClass(
      "rounded-row"
    );
  });
});
