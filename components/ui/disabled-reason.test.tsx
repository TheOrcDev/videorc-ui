import { act, render, waitFor } from "@testing-library/react";
import type { ComponentProps } from "react";
import { describe, expect, it } from "vitest";

import { Button } from "@/components/ui/button";
import { DisabledReason } from "@/components/ui/disabled-reason";

// A disabled control's reason shows on hover and on keyboard focus, and stays
// its description for assistive tech.

const renderReason = (props: Partial<ComponentProps<typeof DisabledReason>>) =>
  render(
    <DisabledReason reason={null} {...props}>
      {props.children ?? <Button disabled>Save changes</Button>}
    </DisabledReason>
  );

const wrapperIn = (container: HTMLElement): HTMLElement | null =>
  container.querySelector<HTMLElement>('[data-slot="disabled-reason"]');

// React's ids hold characters a CSS id selector would need escaped.
const byId = (id: string | null | undefined): HTMLElement | null =>
  document.querySelector<HTMLElement>(`[id="${id ?? ""}"]`);

const tooltipText = (): string | null | undefined =>
  document.querySelector('[data-slot="tooltip-content"]')?.textContent;

describe("DisabledReason", () => {
  it("makes the disabled control focusable through a wrapper the reason describes", () => {
    const { container } = renderReason({
      reason: "You can save when this cut finishes.",
    });
    const trigger = wrapperIn(container);
    expect(trigger?.tabIndex).toBe(0);
    expect(trigger?.querySelector("button")).toBeDisabled();
    const description = byId(trigger?.getAttribute("aria-describedby") ?? "");
    expect(description?.textContent).toBe(
      "You can save when this cut finishes."
    );
    // Out of the reading order, but still the description.
    expect(description?.hidden).toBe(true);
  });

  it("shows the reason as a tooltip on keyboard focus", async () => {
    const { container } = renderReason({
      reason: "Stop the recording or stream before switching orientation.",
    });
    act(() => wrapperIn(container)?.focus());
    await waitFor(() =>
      expect(tooltipText()).toContain(
        "Stop the recording or stream before switching orientation."
      )
    );
  });

  it("renders the control as it is when there is no reason", () => {
    const { container, rerender } = renderReason({ reason: null });
    expect(wrapperIn(container)).toBeNull();
    expect(
      container.querySelector('[data-slot="disabled-reason-text"]')
    ).toBeNull();
    expect(container.firstElementChild?.tagName).toBe("BUTTON");
    rerender(
      <DisabledReason reason="">
        <Button disabled>Save changes</Button>
      </DisabledReason>
    );
    expect(wrapperIn(container)).toBeNull();
  });

  it("keeps a caller id and names the wrapper when asked", () => {
    const { container } = renderReason({
      id: "noise-cleanup-session-1-description",
      label: "Clean up noise in Launch demo",
      reason: "Videorc is reconnecting. Try again in a moment.",
    });
    const trigger = wrapperIn(container);
    expect(trigger).toHaveAttribute(
      "aria-describedby",
      "noise-cleanup-session-1-description"
    );
    expect(trigger).toHaveAttribute(
      "aria-label",
      "Clean up noise in Launch demo"
    );
    expect(
      document.querySelector("#noise-cleanup-session-1-description")
        ?.textContent
    ).toBe("Videorc is reconnecting. Try again in a moment.");
  });

  it("describes a menu or select item in place, with no wrapper, when it is not focusable", () => {
    const { container } = renderReason({
      children: (
        <div aria-selected={false} data-disabled="" role="option">
          4K
        </div>
      ),
      focusable: false,
      reason: "4K exceeds the recording limit.",
    });
    expect(wrapperIn(container)).toBeNull();
    const option = container.querySelector<HTMLElement>('[role="option"]');
    expect(option?.className).toContain("data-disabled:pointer-events-auto");
    expect(
      byId(option?.getAttribute("aria-describedby") ?? "")?.textContent
    ).toBe("4K exceeds the recording limit.");
  });
});
