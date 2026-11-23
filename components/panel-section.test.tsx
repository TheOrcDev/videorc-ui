import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { PanelSection } from "@/components/panel-section";

describe("PanelSection", () => {
  it("passes a section's own props through, such as drop handlers and data hooks", () => {
    const onDrop = vi.fn();
    render(
      <PanelSection
        aria-label="Screens"
        data-probe="screens"
        onDragOver={(event) => event.preventDefault()}
        onDrop={onDrop}
        title="Screens"
      >
        <p>Drop images here</p>
      </PanelSection>
    );
    const section = screen.getByRole("region", { name: "Screens" });
    expect(section).toHaveAttribute("data-slot", "panel-section");
    expect(section).toHaveAttribute("data-probe", "screens");
    fireEvent.drop(section);
    expect(onDrop).toHaveBeenCalledOnce();
  });
});
