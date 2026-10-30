import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import {
  ActivityFeed,
  activityCapabilityNote,
  activityRowActions,
  activityRowTint,
} from "@/components/blocks/stream-manager/activity-feed";
import type { ActivityItem } from "@/components/blocks/stream-manager/activity-feed";

// Activity rows lead with who, carry one tint, and filter by kind with
// counts that follow the platform pick.

const item = (extra: Partial<ActivityItem> = {}): ActivityItem => ({
  id: "a1",
  kind: "follow",
  line: "Followed your channel",
  name: "Hana Ito",
  platform: "twitch",
  short: "New follower",
  time: "2m",
  ...extra,
});

const ITEMS = [
  item(),
  item({
    id: "a2",
    kind: "raid",
    name: "pixelpilot",
    short: "Raid · 42 viewers",
  }),
  item({ id: "a3", kind: "cheer", name: "Leo Park", platform: "youtube" }),
];

describe("ActivityFeed", () => {
  it("shows kind chips with counts, and filters by them", async () => {
    render(<ActivityFeed items={ITEMS} platforms={["twitch", "youtube"]} />);
    expect(screen.getAllByRole("listitem")).toHaveLength(3);
    await userEvent.click(screen.getByRole("button", { name: "Raids 1" }));
    expect(screen.getAllByRole("listitem")).toHaveLength(1);
    expect(screen.getByText("pixelpilot")).toBeInTheDocument();
  });

  it("says what will show, and what a platform never shares", () => {
    render(
      <ActivityFeed
        note={activityCapabilityNote(["x"])}
        onReconnectTwitch={vi.fn()}
        platforms={["x", "twitch"]}
        twitchNeeds={{ followNames: true }}
      />
    );
    expect(
      screen.getByText(
        "Follows, subs, gifts, tips and raids appear here as they happen."
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText("X doesn't share tips. New X followers show as a count.")
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Reconnect Twitch" })
    ).toBeInTheDocument();
  });
});

describe("activityRowTint", () => {
  it("paints one tint, and none on stream", () => {
    expect(activityRowTint(item({ kind: "redemption" }))).toBe("reward");
    expect(activityRowTint(item({ kind: "subscription" }))).toBe("member");
    expect(activityRowTint(item({ kind: "super-chat" }))).toBe("paid");
    expect(
      activityRowTint(
        item({ highlight: { phase: "live" }, kind: "super-chat" })
      )
    ).toBeNull();
  });
});

describe("activityRowActions", () => {
  it("toggles the stream, thanks, and copies", () => {
    const actions = activityRowActions(
      item({ highlight: { phase: "live" }, messageId: "m1" }),
      { onShowOnStream: vi.fn(), onThank: vi.fn() }
    );
    expect(actions.map((action) => action.label)).toEqual([
      "Take off stream",
      "Thank in chat",
      "Copy",
    ]);
  });
});
