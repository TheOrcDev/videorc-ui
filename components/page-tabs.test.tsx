import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { PageTabs } from "@/components/page-tabs";
import { TabsContent } from "@/components/ui/tabs";

// One pinned strip for every page with tabs.

type View = "setup" | "upcoming";

const TABS = [
  { id: "setup", label: "Setup" },
  { id: "upcoming", label: "Upcoming" },
] as const;

const renderTabs = (value: View, onValueChange = vi.fn()) => {
  const view = render(
    <PageTabs<View>
      label="Livestream view"
      onValueChange={onValueChange}
      tabs={TABS}
      testId="livestream-tabs"
      triggerAttribute="data-videorc-livestream-view"
      value={value}
    >
      <TabsContent value="setup">Destinations</TabsContent>
      <TabsContent value="upcoming">Scheduled</TabsContent>
    </PageTabs>
  );
  return { ...view, onValueChange };
};

describe("PageTabs", () => {
  it("owns the page scroll: the strip is pinned and only the region under it scrolls", () => {
    renderTabs("setup");
    const tabs = screen.getByTestId("livestream-tabs");
    expect(tabs).toHaveAttribute("data-pane-scroll", "own");
    const strip = tabs.querySelector("[data-slot=pane-strip]");
    const scroll = tabs.querySelector("[data-slot=page-tabs-scroll]");
    expect(strip?.querySelector("[role=tablist]")).toHaveAttribute(
      "aria-label",
      "Livestream view"
    );
    expect(scroll?.className).toContain("overflow-y-auto");
    expect(scroll).toHaveTextContent("Destinations");
    // The strip comes first and never sits inside the scroll region.
    expect(scroll?.contains(strip ?? null)).toBe(false);
  });

  it("names each trigger by its tab id, so tests and links can find a tab", () => {
    const { container } = renderTabs("upcoming");
    const triggers = [
      ...container.querySelectorAll<HTMLElement>(
        "[data-videorc-livestream-view]"
      ),
    ];
    expect(
      triggers.map((trigger) => trigger.dataset.videorcLivestreamView)
    ).toEqual(["setup", "upcoming"]);
    expect(
      container.querySelector("[data-videorc-livestream-view][data-active]")
        ?.textContent
    ).toBe("Upcoming");
  });

  it("reports the typed tab the streamer picks; the caller keeps it", () => {
    const { onValueChange } = renderTabs("setup");
    fireEvent.click(screen.getByRole("tab", { name: "Upcoming" }));
    expect(onValueChange).toHaveBeenCalledWith("upcoming");
    // The caller hasn't moved: Setup is still the tab on screen.
    expect(screen.getByRole("tab", { name: "Setup" })).toHaveAttribute(
      "data-active"
    );
  });

  it("starts a new tab at the top: the scroll region is a new element", () => {
    const { container, rerender, onValueChange } = renderTabs("setup");
    const before = container.querySelector("[data-slot=page-tabs-scroll]");
    rerender(
      <PageTabs<View>
        label="Livestream view"
        onValueChange={onValueChange}
        tabs={TABS}
        value="upcoming"
      >
        <TabsContent value="setup">Destinations</TabsContent>
        <TabsContent value="upcoming">Scheduled</TabsContent>
      </PageTabs>
    );
    const after = container.querySelector("[data-slot=page-tabs-scroll]");
    expect(after).not.toBe(before);
    expect(after).toHaveTextContent("Scheduled");
  });
});
