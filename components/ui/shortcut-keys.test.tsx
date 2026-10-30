import { act, render, screen } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it } from "vitest";

import { Button } from "@/components/ui/button";
import { KBD_ON_FILLED_BUTTON } from "@/components/ui/kbd";
import { ShortcutKeys } from "@/components/ui/shortcut-keys";
import { ShortcutTooltip } from "@/components/ui/shortcut-tooltip";

// One renderer for every shortcut.

afterEach(() => {
  delete document.documentElement.dataset.platform;
});

const kbd = (container: HTMLElement): HTMLElement | null =>
  container.querySelector("kbd");

describe("ShortcutKeys", () => {
  it("is one macOS keycap in system order", () => {
    const { container } = render(
      <ShortcutKeys accelerator="CmdOrCtrl+Shift+J" platform="darwin" />
    );
    expect(container.querySelectorAll("kbd")).toHaveLength(1);
    expect(kbd(container)).toHaveTextContent("⇧⌘J");
    expect(kbd(container)).toHaveAttribute("data-slot", "kbd");
    expect(kbd(container)).toHaveAttribute(
      "data-accelerator",
      "CmdOrCtrl+Shift+J"
    );
  });

  it("is words joined by + on Windows and Linux", () => {
    const { container, rerender } = render(
      <ShortcutKeys accelerator="CmdOrCtrl+Shift+J" platform="win32" />
    );
    expect(kbd(container)?.textContent).toBe("Ctrl+Shift+J");
    rerender(<ShortcutKeys accelerator="Space" platform="linux" />);
    expect(kbd(container)?.textContent).toBe("Space");
  });

  it("reads the platform the bootstrap set before the first paint", () => {
    document.documentElement.dataset.platform = "darwin";
    const { container, rerender } = render(
      <ShortcutKeys accelerator="CmdOrCtrl+P" />
    );
    expect(kbd(container)?.textContent).toBe("⌘P");
    document.documentElement.dataset.platform = "win32";
    rerender(<ShortcutKeys accelerator="CmdOrCtrl+P" />);
    expect(kbd(container)?.textContent).toBe("Ctrl+P");
  });

  it("prints the Windows spelling on a server, which knows no platform", () => {
    expect(
      renderToString(<ShortcutKeys accelerator="CmdOrCtrl+K" />)
    ).toContain("Ctrl+K");
    expect(
      renderToString(
        <ShortcutKeys accelerator="CmdOrCtrl+K" platform="darwin" />
      )
    ).toContain("⌘K");
  });

  it("prints the status bar hint as quiet text, no keycap", () => {
    const { container } = render(
      <ShortcutKeys
        accelerator="CmdOrCtrl+K"
        platform="darwin"
        variant="text"
      />
    );
    expect(kbd(container)).toBeNull();
    expect(
      container.querySelector('[data-slot="shortcut-keys"]')?.textContent
    ).toBe("⌘K");
  });

  it("renders nothing for an unbound shortcut", () => {
    const { container } = render(
      <ShortcutKeys accelerator="" platform="darwin" />
    );
    expect(container.innerHTML).toBe("");
  });

  it("takes the filled button style inside primary, destructive and record buttons", () => {
    const { container } = render(
      <Button>
        Save
        <ShortcutKeys accelerator="Enter" platform="darwin" />
      </Button>
    );
    expect(kbd(container)?.textContent).toBe("↵");
    for (const token of KBD_ON_FILLED_BUTTON.split(" ")) {
      expect(kbd(container)?.className).toContain(token);
    }
    for (const variant of ["default", "destructive", "record"]) {
      expect(KBD_ON_FILLED_BUTTON).toContain(
        `[[data-slot=button][data-variant=${variant}]_&]:text-current`
      );
    }
  });
});

describe("ShortcutTooltip", () => {
  it("shows the label and the bound shortcut as one keycap", async () => {
    render(
      <ShortcutTooltip
        accelerator="Cmd+Shift+M"
        label="Mute microphone"
        platform="darwin"
      >
        <button type="button">Mute</button>
      </ShortcutTooltip>
    );
    act(() => screen.getByRole("button", { name: "Mute" }).focus());
    const label = await screen.findByText("Mute microphone");
    const content = label.closest('[data-slot="tooltip-content"]');
    expect(content).not.toBeNull();
    expect(content?.querySelector("kbd")?.textContent).toBe("⇧⌘M");
  });

  it("keeps the trigger's attributes off the control", () => {
    render(
      <ShortcutTooltip accelerator="CmdOrCtrl+M" label="Mute microphone">
        <button type="button">Mute</button>
      </ShortcutTooltip>
    );
    const control = screen.getByRole("button", { name: "Mute" });
    expect(control.parentElement?.tagName).toBe("SPAN");
    expect(control.parentElement).toHaveAttribute(
      "data-slot",
      "tooltip-trigger"
    );
    expect(control).not.toHaveAttribute("data-slot", "tooltip-trigger");
  });
});
