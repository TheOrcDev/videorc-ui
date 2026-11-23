import { act, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { StatusBarAction } from "@/components/status-bar-action";

const tooltipText = (text: string): Promise<HTMLElement> =>
  screen.findByText(text, {
    selector: '[data-slot="tooltip-content"], [data-slot="tooltip-content"] *',
  });

describe("StatusBarAction", () => {
  it("draws an icon alone as a narrow chip, and a word with its side bearing", () => {
    render(
      <>
        <StatusBarAction icon={<svg aria-hidden />} label="Notifications" />
        <StatusBarAction label="Chat" text="Chat" />
      </>
    );
    expect(screen.getByRole("button", { name: "Notifications" })).toHaveClass(
      "px-1"
    );
    expect(screen.getByRole("button", { name: "Chat" })).not.toHaveClass(
      "px-1"
    );
  });

  it("shows its tooltip's own words instead of the whole name", async () => {
    render(
      <StatusBarAction
        icon={<svg aria-hidden />}
        label="Notifications, 2 unread"
        tooltip="Notifications"
      />
    );
    const button = screen.getByRole("button", {
      name: "Notifications, 2 unread",
    });
    act(() => button.focus());
    expect(await tooltipText("Notifications")).toBeInTheDocument();
    expect(screen.queryByText("Notifications, 2 unread")).toBeNull();
  });
});
