import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import type { ChatDestination } from "@/components/blocks/stream-manager/chat-platform";
import {
  StreamManagerStatusBar,
  destinationCapabilityLabel,
} from "@/components/blocks/stream-manager/stream-manager-status-bar";

// Quiet when fine: a word only when chat needs the streamer, and Clear asks
// before it empties the view.

const YOUTUBE: ChatDestination = {
  id: "yt",
  platform: "youtube",
  state: "connected",
  write: "ready",
};
const X: ChatDestination = {
  id: "x",
  platform: "x",
  state: "connected",
  write: "read-only",
};
const DESTINATIONS = [YOUTUBE, X];

describe("destinationCapabilityLabel", () => {
  it("says nothing for a platform that reads and sends", () => {
    expect(destinationCapabilityLabel(YOUTUBE)).toBe("");
    expect(destinationCapabilityLabel(X)).toBe("read-only");
  });
});

describe("StreamManagerStatusBar", () => {
  it("names each chat state and words only the exception", () => {
    render(<StreamManagerStatusBar destinations={DESTINATIONS} />);
    expect(
      screen.getByRole("button", { name: "YouTube chat: reads and sends" })
    ).toBeInTheDocument();
    expect(screen.getByText("X read-only")).toBeInTheDocument();
  });

  it("asks before Clear empties the view", async () => {
    const onClear = vi.fn();
    render(
      <StreamManagerStatusBar destinations={DESTINATIONS} onClear={onClear} />
    );
    await userEvent.click(screen.getByRole("button", { name: "Clear view" }));
    expect(onClear).not.toHaveBeenCalled();
    await userEvent.click(
      await screen.findByRole("button", { name: "Clear view" })
    );
    expect(onClear).toHaveBeenCalledTimes(1);
  });
});
