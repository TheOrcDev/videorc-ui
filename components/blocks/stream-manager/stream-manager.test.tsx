import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import {
  StreamManager,
  paneClasses,
} from "@/components/blocks/stream-manager/stream-manager";
import type { StreamManagerProps } from "@/components/blocks/stream-manager/stream-manager";

// One window, three widths: every pane renders once and only its placement
// changes. The window's keys answer while focus is inside it.

const PROPS: StreamManagerProps = {
  destinations: [
    { id: "yt", platform: "youtube", state: "connected", write: "ready" },
  ],
  live: true,
  messages: [
    {
      authorName: "Maya Chen",
      id: "m1",
      platform: "youtube",
      text: "Which microphone is that?",
    },
  ],
  onSend: vi.fn(),
  stats: [
    {
      badge: "live",
      description: "On air for 30:44",
      details: [],
      id: "session",
      label: "Session",
      tone: "neutral",
      value: "30:44",
    },
  ],
};

describe("paneClasses", () => {
  it("keeps Chat at Wide and shows the right pane that's picked", () => {
    expect(paneClasses("chat", "activity", "activity")).toContain("hidden");
    expect(paneClasses("chat", "activity", "activity")).toContain(
      "@min-[1040px]/stream-manager:flex"
    );
    expect(paneClasses("buddy", "chat", "activity")).toContain(
      "@min-[1040px]/stream-manager:hidden"
    );
  });
});

describe("StreamManager", () => {
  it("titles the window and renders each pane once", () => {
    render(
      <StreamManager
        {...PROPS}
        buddy={{ name: "Orcle", pane: <p>Buddy pane</p>, tone: "good" }}
      />
    );
    expect(
      screen.getByRole("heading", { level: 1, name: "Stream Manager" })
    ).toBeInTheDocument();
    expect(screen.getAllByRole("region", { name: "Chat" })).toHaveLength(1);
    expect(screen.getAllByText("Buddy pane")).toHaveLength(1);
  });

  it("brings Buddy forward on ⌘J and searches chat on ⌘F", () => {
    render(
      <StreamManager
        {...PROPS}
        buddy={{ name: "Orcle", pane: <p>Buddy pane</p> }}
      />
    );
    const search = screen.getByRole("textbox", { name: "Search chat" });
    fireEvent.keyDown(search, { key: "j", metaKey: true });
    const buddyPane = screen.getByText("Buddy pane").parentElement;
    expect(buddyPane?.className).toMatch(/^flex|\sflex\s/u);
    fireEvent.keyDown(buddyPane ?? document.body, { ctrlKey: true, key: "f" });
    expect(search).toHaveFocus();
  });
});
