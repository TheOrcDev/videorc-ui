import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import {
  ChatComposer,
  chatDestinationNotes,
  chatDraftMaxChars,
} from "@/components/blocks/stream-manager/chat-composer";
import type { ChatDestination } from "@/components/blocks/stream-manager/chat-platform";
import {
  DEFAULT_CHAT_FILTER,
  filterChatMessages,
} from "@/components/blocks/stream-manager/chat-toolbar";

// The composer names only the exceptions, fits the strictest destination,
// and keeps local commands out of chat.

const DESTINATIONS: ChatDestination[] = [
  { id: "yt", platform: "youtube", state: "connected", write: "ready" },
  { id: "tw", platform: "twitch", state: "connected", write: "missing-scope" },
  { id: "x", platform: "x", state: "connected", write: "read-only" },
];

describe("chatDestinationNotes", () => {
  it("names what a send skips, never what it reaches", () => {
    expect(chatDestinationNotes(DESTINATIONS, ["youtube"])).toBe(
      "Twitch reconnect to send · X read-only"
    );
    expect(chatDestinationNotes([], [])).toBe("No writable destinations");
  });
});

describe("chatDraftMaxChars", () => {
  it("fits the strictest destination", () => {
    expect(chatDraftMaxChars(["youtube", "twitch"])).toBe(200);
    expect(chatDraftMaxChars(["youtube", "x"])).toBe(140);
  });
});

describe("ChatComposer", () => {
  it("sends on Enter to every writable destination and clears", async () => {
    const onSend = vi.fn();
    render(<ChatComposer destinations={DESTINATIONS} onSend={onSend} />);
    const field = screen.getByRole("textbox", { name: "Message" });
    await userEvent.type(field, "Thanks for the raid!{Enter}");
    expect(onSend).toHaveBeenCalledWith("Thanks for the raid!", {});
    expect(field).toHaveValue("");
    expect(
      screen.getByText("Twitch reconnect to send · X read-only")
    ).toBeInTheDocument();
  });

  it("runs a local command instead of posting it", async () => {
    const onSend = vi.fn();
    const onCommand = vi.fn();
    render(
      <ChatComposer
        commands={[{ hint: " · Save a clip", value: "/clip" }]}
        destinations={DESTINATIONS}
        onCommand={onCommand}
        onSend={onSend}
      />
    );
    const field = screen.getByRole("textbox", {
      name: "Message or local command",
    });
    await userEvent.type(field, "/clip{Enter}");
    expect(onCommand).toHaveBeenCalledWith("/clip");
    expect(onSend).not.toHaveBeenCalled();
  });
});

describe("filterChatMessages", () => {
  it("narrows by platform and search through words and names", () => {
    const messages = [
      { authorName: "Maya", id: "1", platform: "youtube" as const, text: "Hi" },
      {
        authorName: "Jonas",
        id: "2",
        platform: "twitch" as const,
        text: "Mic?",
      },
    ];
    expect(
      filterChatMessages(messages, {
        ...DEFAULT_CHAT_FILTER,
        platform: "twitch",
      })
    ).toEqual([messages[1]]);
    expect(
      filterChatMessages(messages, { ...DEFAULT_CHAT_FILTER, search: "maya" })
    ).toEqual([messages[0]]);
  });
});
