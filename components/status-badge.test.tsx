import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CameraIcon } from "@/components/icons";
import { StatusBadge } from "@/components/status-badge";
import { StatusDot } from "@/components/status-dot";

describe("StatusBadge", () => {
  it("is a glass chip with the tone in its dot and monochrome words", () => {
    const { container } = render(
      <StatusBadge label="Chat" tone="good" value="Connected" />
    );
    const badge = container.querySelector("[data-slot=status-badge]");
    expect(badge).toHaveClass("glass-chip", "tone-success", "text-foreground");
    expect(badge).toHaveAttribute("data-tone", "good");
    expect(badge?.querySelector(".glass-dot")).not.toBeNull();
    expect(screen.getByText("Chat")).toHaveClass("text-muted-foreground");
  });

  it("tints the whole chip for an error or an on-air session, with no dot", () => {
    const { container } = render(<StatusBadge tone="live" value="On air" />);
    const badge = container.querySelector("[data-slot=status-badge]");
    expect(badge).toHaveClass("glass-chip-tinted", "tone-live");
    expect(badge?.querySelector(".glass-dot")).toBeNull();
  });

  it("lets a leading icon replace the dot and take the tone", () => {
    const { container } = render(
      <StatusBadge icon={CameraIcon} tone="warn" value="Needs permission" />
    );
    const badge = container.querySelector("[data-slot=status-badge]");
    expect(badge?.querySelector(".glass-dot")).toBeNull();
    expect(badge?.querySelector("svg")).toHaveClass("text-(--chip-tone)");
  });

  it("refuses a raw status value under test", () => {
    expect(() =>
      render(<StatusBadge tone="warn" value="device-missing" />)
    ).toThrow(/raw status value "device-missing"/u);
  });
});

describe("StatusDot", () => {
  it("glows the tone in the dot beside a muted label, and pulses on request", () => {
    const { container } = render(
      <StatusDot label="Recording" pulse tone="live" />
    );
    const dot = container.querySelector("[data-slot=status-dot]");
    expect(dot).toHaveClass("tone-live", "text-muted-foreground");
    expect(dot?.querySelector(".motion-safe\\:animate-ping")).not.toBeNull();
    expect(screen.getByText("Recording")).toBeInTheDocument();
  });

  it("refuses a raw status value under test", () => {
    expect(() => render(<StatusDot label="idle" />)).toThrow(
      /StatusDot got the raw status value "idle"/u
    );
  });
});
