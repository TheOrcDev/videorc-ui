import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { PowerSlider } from "@/components/power-slider";

// Edge-aligned thumbs stay hidden until Base UI measures the control, which
// jsdom never lays out, so the thumb is found among hidden elements and its
// name read from the label it points at.
const thumb = (): HTMLElement => {
  const [first] = screen.getAllByRole("slider", { hidden: true });
  if (!first) {
    throw new Error("No slider thumb");
  }
  return first;
};

describe("PowerSlider", () => {
  it("names its thumb by the label and reads the value with its unit", () => {
    render(
      <PowerSlider
        label="Noise cleanup"
        max={100}
        min={0}
        onChange={vi.fn()}
        suffix="%"
        value={40}
      />
    );
    const labelledBy = thumb().getAttribute("aria-labelledby") ?? "";
    expect(
      document.querySelector(`#${CSS.escape(labelledBy)}`)
    ).toHaveTextContent("Noise cleanup");
    expect(screen.getByText("40%")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Reset Noise cleanup" })
    ).toBeNull();
  });

  it("resets to the default once the value drifts, and commits it", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const onCommit = vi.fn();
    render(
      <PowerSlider
        defaultValue={50}
        label="Noise cleanup"
        max={100}
        min={0}
        onChange={onChange}
        onCommit={onCommit}
        value={80}
      />
    );
    await user.click(
      screen.getByRole("button", { name: "Reset Noise cleanup" })
    );
    expect(onChange).toHaveBeenCalledWith(50);
    expect(onCommit).toHaveBeenCalledWith(50);
  });

  it("commits a typed number, clamped and snapped, on Enter", async () => {
    const user = userEvent.setup();
    const onCommit = vi.fn();
    render(
      <PowerSlider
        label="Mic delay"
        max={500}
        min={0}
        numericInput
        onChange={vi.fn()}
        onCommit={onCommit}
        step={10}
        value={120}
      />
    );
    const input = screen.getByRole("textbox", { name: "Mic delay value" });
    await user.clear(input);
    await user.type(input, "999{Enter}");
    expect(onCommit).toHaveBeenCalledWith(500);
  });

  it("moves by the large step on Shift+arrow", () => {
    const onChange = vi.fn();
    render(
      <PowerSlider
        label="Noise cleanup"
        max={100}
        min={0}
        onChange={onChange}
        step={1}
        value={40}
      />
    );
    fireEvent.keyDown(thumb(), {
      key: "ArrowRight",
      shiftKey: true,
    });
    expect(onChange).toHaveBeenLastCalledWith(50);
  });

  it("says why it's disabled under the track", () => {
    render(
      <PowerSlider
        disabled
        disabledReason="Turn on the microphone to adjust it."
        label="Noise cleanup"
        max={100}
        min={0}
        onChange={vi.fn()}
        value={40}
      />
    );
    expect(thumb()).toBeDisabled();
    expect(
      screen.getByText("Turn on the microphone to adjust it.")
    ).toBeInTheDocument();
  });
});
