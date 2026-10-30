import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  DEFAULT_STATS_LAYOUT,
  StreamStatsBar,
  arrangeStats,
  moveStat,
  setStatHidden,
} from "@/components/blocks/stream-manager/stream-stats-bar";
import type { StatItem } from "@/components/blocks/stream-manager/stream-stats-bar";

// The main slots hold the clock and the viewer count, always; the rest
// follow, and a hidden stat is gone from both.

const stat = (id: StatItem["id"], value: string): StatItem => ({
  description: `${id} ${value}`,
  details: [],
  id,
  label: id,
  tone: "neutral",
  value,
});

const ITEMS = [
  stat("session", "30:44"),
  stat("viewers", "1.2k"),
  stat("followers", "61,942"),
  stat("chat", "22"),
];

describe("arrangeStats", () => {
  it("fills the three main slots first, in layout order", () => {
    const { main, more } = arrangeStats(ITEMS);
    expect(main.map((item) => item.id)).toEqual([
      "session",
      "viewers",
      "followers",
    ]);
    expect(more.map((item) => item.id)).toEqual(["chat"]);
  });

  it("leaves a hidden stat out", () => {
    const layout = setStatHidden(DEFAULT_STATS_LAYOUT, "followers", true);
    expect(arrangeStats(ITEMS, layout).main.map((item) => item.id)).toEqual([
      "session",
      "viewers",
    ]);
  });
});

describe("the locked stats", () => {
  it("never hides the clock or the viewer count", () => {
    expect(setStatHidden(DEFAULT_STATS_LAYOUT, "viewers", true)).toBe(
      DEFAULT_STATS_LAYOUT
    );
  });

  it("refuses a move that pushes the viewer count out of the main slots", () => {
    expect(moveStat(DEFAULT_STATS_LAYOUT, "viewers", 4)).toBe(
      DEFAULT_STATS_LAYOUT
    );
    expect(moveStat(DEFAULT_STATS_LAYOUT, "chat", 2).order.slice(0, 3)).toEqual(
      ["session", "viewers", "chat"]
    );
  });
});

describe("StreamStatsBar", () => {
  it("names each stat by its whole reading, and says ON AIR", () => {
    render(
      <StreamStatsBar
        items={[{ ...ITEMS[0], badge: "live" } as StatItem, ...ITEMS.slice(1)]}
      />
    );
    expect(
      screen.getByRole("region", { name: "Stream stats" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("img", { name: "viewers 1.2k" })
    ).toBeInTheDocument();
    expect(screen.getByText("ON AIR")).toBeInTheDocument();
  });
});
