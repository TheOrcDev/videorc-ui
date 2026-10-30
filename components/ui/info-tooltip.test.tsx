import { act, render, screen, waitFor } from "@testing-library/react";
import type { ComponentProps } from "react";
import { describe, expect, it } from "vitest";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { InfoTooltip } from "@/components/ui/info-tooltip";

// What a chip means reaches the keyboard and a screen reader, never only a
// native title.

const renderInfo = (props: Partial<ComponentProps<typeof InfoTooltip>>) =>
  render(
    <InfoTooltip content={null} {...props}>
      {props.children ?? <Badge variant="destructive">MP4 failed</Badge>}
    </InfoTooltip>
  );

const wrapperIn = (container: HTMLElement): HTMLElement | null =>
  container.querySelector<HTMLElement>('[data-slot="info-tooltip"]');

// React's ids hold characters a CSS id selector would need escaped.
const byId = (id: string | null | undefined): HTMLElement | null =>
  document.querySelector<HTMLElement>(`[id="${id ?? ""}"]`);

const tooltipText = (): string | null | undefined =>
  document.querySelector('[data-slot="tooltip-content"]')?.textContent;

describe("InfoTooltip", () => {
  it("makes a chip focusable through a wrapper its explanation describes", () => {
    const { container } = renderInfo({ content: "The disk is full." });
    const trigger = wrapperIn(container);
    expect(trigger?.tabIndex).toBe(0);
    expect(trigger?.textContent).toBe("MP4 failed");
    const description = byId(trigger?.getAttribute("aria-describedby") ?? "");
    expect(description?.textContent).toBe("The disk is full.");
    expect(description?.hidden).toBe(true);
    expect(container.querySelector("[title]")).toBeNull();
  });

  it("shows the explanation as a tooltip on keyboard focus", async () => {
    const { container } = renderInfo({ content: "The disk is full." });
    act(() => wrapperIn(container)?.focus());
    await waitFor(() => expect(tooltipText()).toContain("The disk is full."));
  });

  it("leaves a roving row out of the tab order while still describing the chip", () => {
    const { container } = renderInfo({
      content: "The disk is full.",
      tabIndex: -1,
    });
    expect(wrapperIn(container)?.tabIndex).toBe(-1);
  });

  it("renders the chip exactly as it is when there is nothing to explain", () => {
    const { container } = renderInfo({ content: "" });
    expect(wrapperIn(container)).toBeNull();
    expect(container.textContent).toBe("MP4 failed");
  });

  it("describes a control that takes focus itself, with no wrapper", async () => {
    const { container } = renderInfo({
      children: <Button>Authorize X Live</Button>,
      content: "Opens x.com to approve live broadcasting for this account.",
      focusable: false,
    });
    expect(wrapperIn(container)).toBeNull();
    const button = screen.getByRole("button", { name: "Authorize X Live" });
    const description = byId(button.getAttribute("aria-describedby") ?? "");
    expect(description?.textContent).toBe(
      "Opens x.com to approve live broadcasting for this account."
    );
    act(() => button.focus());
    await waitFor(() => expect(tooltipText()).toContain("Opens x.com"));
  });
});
