import { act, fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import type { ReactElement } from "react";
import { describe, expect, it } from "vitest";

import { Field, FieldLabel } from "@/components/ui/field";
import {
  SegmentedControl,
  segmentedTabStop,
  segmentedTargetIndex,
} from "@/components/ui/segmented-control";
import type {
  SegmentedControlOption,
  SegmentedControlProps,
} from "@/components/ui/segmented-control";

// One segmented control: a radio group with roving focus, named by its Field,
// and never disabled without saying why.

type Theme = "light" | "dark" | "system";

const THEMES: SegmentedControlOption<Theme>[] = [
  { label: "Light", value: "light" },
  { label: "Dark", value: "dark" },
  { label: "System", value: "system" },
];

/** A controlled control that records every change it is asked to make. */
const Controlled = ({
  initial,
  changes,
  ...props
}: Omit<SegmentedControlProps<Theme>, "value" | "onValueChange"> & {
  initial: Theme | null;
  changes: Theme[];
}): ReactElement => {
  const [value, setValue] = useState<Theme | null>(initial);
  return (
    <SegmentedControl<Theme>
      {...props}
      onValueChange={(next) => {
        changes.push(next);
        setValue(next);
      }}
      value={value}
    />
  );
};

const group = (): HTMLElement => screen.getByRole("radiogroup");

const radios = (): HTMLButtonElement[] =>
  screen.getAllByRole<HTMLButtonElement>("radio");

const radio = (label: string): HTMLButtonElement => {
  const found = radios().find((candidate) => candidate.textContent === label);
  if (!found) {
    throw new Error(`No radio labelled "${label}"`);
  }
  return found;
};

const checkedLabels = (): string[] =>
  radios()
    .filter((candidate) => candidate.getAttribute("aria-checked") === "true")
    .map((candidate) => candidate.textContent ?? "");

const tabStops = (): string[] =>
  radios()
    .filter((candidate) => candidate.tabIndex === 0)
    .map((candidate) => candidate.textContent ?? "");

const press = (key: string): void => {
  const target = document.activeElement;
  expect(target?.getAttribute("role")).toBe("radio");
  if (target) {
    fireEvent.keyDown(target, { key });
  }
};

const focused = (): string => document.activeElement?.textContent ?? "";

describe("SegmentedControl", () => {
  it("is a radio group with one checked radio and one tab stop", () => {
    render(
      <Controlled
        aria-label="Theme"
        changes={[]}
        initial="dark"
        options={THEMES}
      />
    );
    expect(group()).toHaveAttribute("data-slot", "segmented-control");
    expect(radios()).toHaveLength(3);
    expect(checkedLabels()).toEqual(["Dark"]);
    expect(radio("Dark")).toHaveAttribute("data-checked");
    expect(radio("Dark")).not.toHaveAttribute("data-unchecked");
    expect(radio("Light")).toHaveAttribute("data-unchecked");
    expect(tabStops()).toEqual(["Dark"]);
    for (const candidate of radios()) {
      expect(candidate.type).toBe("button");
    }
  });

  it("wears the Tabs track, with the checked segment as the chrome plate", () => {
    render(
      <Controlled
        aria-label="Theme"
        changes={[]}
        initial="dark"
        options={THEMES}
      />
    );
    expect(group().className).toContain("ring-border");
    expect(group().className).toContain("rounded-row");
    expect(radio("Dark").className).toContain("aria-checked:chrome-plate");
  });

  it("lets Tab reach the first enabled option when nothing is checked", () => {
    render(
      <Controlled
        aria-label="Corner"
        changes={[]}
        initial={null}
        options={[
          { disabled: true, label: "Light", value: "light" },
          ...THEMES.slice(1),
        ]}
      />
    );
    expect(checkedLabels()).toEqual([]);
    expect(tabStops()).toEqual(["Dark"]);
  });

  it("moves and checks with the arrows, Home and End, wrapping and skipping disabled options", () => {
    const changes: Theme[] = [];
    const [light, dark, system] = THEMES;
    render(
      <Controlled
        aria-label="Theme"
        changes={changes}
        initial="light"
        options={[
          light as SegmentedControlOption<Theme>,
          { ...(dark as SegmentedControlOption<Theme>), disabled: true },
          system as SegmentedControlOption<Theme>,
        ]}
      />
    );
    act(() => radio("Light").focus());
    press("ArrowRight");
    expect(focused()).toBe("System");
    expect(checkedLabels()).toEqual(["System"]);
    press("ArrowRight");
    expect(focused()).toBe("Light");
    press("ArrowLeft");
    expect(focused()).toBe("System");
    press("Home");
    expect(focused()).toBe("Light");
    press("End");
    expect(focused()).toBe("System");
    press("ArrowUp");
    expect(focused()).toBe("Light");
    press("ArrowDown");
    expect(focused()).toBe("System");
    expect(changes).toEqual([
      "system",
      "light",
      "system",
      "light",
      "system",
      "light",
      "system",
    ]);
    expect(tabStops()).toEqual(["System"]);
  });

  it("in manual activation, only moves focus until Space or a click checks", () => {
    const changes: Theme[] = [];
    render(
      <Controlled
        activationMode="manual"
        aria-label="Theme"
        changes={changes}
        initial="light"
        options={THEMES}
      />
    );
    act(() => radio("Light").focus());
    press("ArrowRight");
    expect(focused()).toBe("Dark");
    expect(changes).toEqual([]);
    expect(checkedLabels()).toEqual(["Light"]);
    fireEvent.click(radio("Dark"));
    expect(changes).toEqual(["dark"]);
    expect(checkedLabels()).toEqual(["Dark"]);
  });

  it("never reports the value that is already checked", () => {
    const changes: Theme[] = [];
    render(
      <Controlled
        aria-label="Theme"
        changes={changes}
        initial="dark"
        options={THEMES}
      />
    );
    fireEvent.click(radio("Dark"));
    expect(changes).toEqual([]);
    fireEvent.click(radio("Light"));
    expect(changes).toEqual(["light"]);
  });

  it("leaves other keys and modified arrows alone", () => {
    const changes: Theme[] = [];
    render(
      <Controlled
        aria-label="Theme"
        changes={changes}
        initial="dark"
        options={THEMES}
      />
    );
    act(() => radio("Dark").focus());
    press("a");
    fireEvent.keyDown(radio("Dark"), { key: "ArrowRight", metaKey: true });
    expect(focused()).toBe("Dark");
    expect(changes).toEqual([]);
  });

  it("is named by its Field label, unless it names itself", () => {
    const { rerender } = render(
      <Field>
        <FieldLabel>Theme</FieldLabel>
        <Controlled changes={[]} initial="dark" options={THEMES} />
      </Field>
    );
    const label = document.querySelector<HTMLLabelElement>(
      '[data-slot="field-label"]'
    );
    expect(label?.id).toBeTruthy();
    expect(group()).toHaveAttribute("aria-labelledby", label?.id);
    expect(label).not.toHaveAttribute("for");

    rerender(
      <Field>
        <FieldLabel>Snap</FieldLabel>
        <Controlled
          aria-label="Theme choice"
          changes={[]}
          initial="dark"
          options={THEMES}
        />
      </Field>
    );
    expect(group()).not.toHaveAttribute("aria-labelledby");
    expect(group()).toHaveAttribute("aria-label", "Theme choice");
  });

  it("names an icon option by its aria-label and passes its data attributes", () => {
    render(
      <SegmentedControl<"h" | "v">
        aria-label="Orientation"
        onValueChange={() => null}
        options={[
          {
            "aria-label": "Horizontal",
            "data-orientation-option": "h",
            label: <svg />,
            value: "h",
          },
          {
            "aria-label": "Vertical",
            "data-orientation-option": "v",
            label: <svg />,
            value: "v",
          },
        ]}
        value="v"
      />
    );
    const vertical = document.querySelector('[data-orientation-option="v"]');
    expect(vertical).toHaveAttribute("aria-label", "Vertical");
    expect(vertical).toHaveAttribute("aria-checked", "true");
  });

  it("names an icon option on hover and focus with a tooltip, never a title", async () => {
    render(
      <SegmentedControl<"h" | "v">
        aria-label="Orientation"
        onValueChange={() => null}
        options={[
          {
            "aria-label": "Horizontal",
            label: <svg />,
            tooltip: "Horizontal · 16:9",
            value: "h",
          },
          {
            "aria-label": "Vertical",
            label: <svg />,
            tooltip: "Vertical · 9:16",
            value: "v",
          },
        ]}
        value="v"
      />
    );
    const options = radios();
    expect(options).toHaveLength(2);
    // The segment keeps its own checked state under the tooltip trigger.
    expect(
      options.map((option) => Object.hasOwn(option.dataset, "checked"))
    ).toEqual([false, true]);
    expect(options.some((option) => option.hasAttribute("title"))).toBe(false);
    expect(options[0]).not.toHaveAttribute("tooltip");
    act(() => options[1]?.focus());
    expect(
      await screen.findByText("Vertical · 9:16", {
        selector:
          '[data-slot="tooltip-content"], [data-slot="tooltip-content"] *',
      })
    ).toBeInTheDocument();
  });

  it("says why it is disabled, and describes the group with the reason", () => {
    const reason = "The canvas is fixed while you record or stream.";
    const changes: Theme[] = [];
    render(
      <Controlled
        aria-label="Theme"
        changes={changes}
        disabled
        disabledReason={reason}
        initial="dark"
        options={THEMES}
      />
    );
    for (const candidate of radios()) {
      expect(candidate).toBeDisabled();
    }
    expect(group()).toHaveAttribute("aria-disabled", "true");
    const describedBy = group().getAttribute("aria-describedby");
    expect(describedBy).toBeTruthy();
    expect(document.querySelector(`[id="${describedBy}"]`)).toHaveTextContent(
      reason
    );
    fireEvent.click(radio("Light"));
    expect(changes).toEqual([]);
    expect(checkedLabels()).toEqual(["Dark"]);
  });

  it("shows no reason while enabled", () => {
    render(
      <Controlled
        aria-label="Theme"
        changes={[]}
        disabledReason="Locked while live."
        initial="dark"
        options={THEMES}
      />
    );
    expect(screen.queryByText("Locked while live.")).toBeNull();
    expect(group()).not.toHaveAttribute("aria-describedby");
    expect(group()).not.toHaveAttribute("aria-disabled");
  });
});

describe("segmented keyboard targets", () => {
  it("wraps, skips disabled options and ignores other keys", () => {
    const enabled = [true, false, true, true];
    expect(segmentedTargetIndex(enabled, 0, "ArrowRight")).toBe(2);
    expect(segmentedTargetIndex(enabled, 3, "ArrowRight")).toBe(0);
    expect(segmentedTargetIndex(enabled, 0, "ArrowLeft")).toBe(3);
    expect(segmentedTargetIndex(enabled, 2, "ArrowUp")).toBe(0);
    expect(segmentedTargetIndex(enabled, 2, "Home")).toBe(0);
    expect(segmentedTargetIndex(enabled, 0, "End")).toBe(3);
    expect(segmentedTargetIndex(enabled, 0, "Enter")).toBeNull();
    expect(segmentedTargetIndex([false, false], 0, "ArrowRight")).toBeNull();
  });

  it("puts the tab stop on the checked option, else the first enabled one", () => {
    expect(segmentedTabStop([true, true, true], 1)).toBe(1);
    expect(segmentedTabStop([true, true, true], -1)).toBe(0);
    expect(segmentedTabStop([false, true, true], 0)).toBe(1);
    expect(segmentedTabStop([false, false], -1)).toBe(-1);
  });
});
