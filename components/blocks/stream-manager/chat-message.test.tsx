import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import {
  ChatMessage,
  chatMessageInitials,
  chatMessageMentions,
  chatMessageMenu,
} from "@/components/blocks/stream-manager/chat-message";
import type { ChatMessageData } from "@/components/blocks/stream-manager/chat-message";

// One chat row: a button named by what it says, one tint at most, and a ⋯
// menu whose only "remove" is Remove from chat.

const message = (extra: Partial<ChatMessageData> = {}): ChatMessageData => ({
  authorName: "Maya Chen",
  id: "m1",
  platform: "youtube",
  text: "Which microphone is that?",
  ...extra,
});

const renderRow = (ui: React.ReactElement) =>
  render(<ol aria-label="Chat messages">{ui}</ol>);

describe("ChatMessage", () => {
  it("is one button named by its author, platform and words", async () => {
    const onHighlight = vi.fn();
    renderRow(<ChatMessage message={message()} onHighlight={onHighlight} />);
    const row = screen.getByRole("button", {
      name: "Maya Chen on YouTube: Which microphone is that?",
    });
    expect(row).toHaveAttribute("aria-pressed", "false");
    await userEvent.click(row);
    expect(onHighlight).toHaveBeenCalledWith(message());
  });

  it("wears the live plate on stream, and no tint beside it", () => {
    renderRow(
      <ChatMessage
        highlight={{ phase: "live" }}
        message={message({ authorRoles: ["member"] })}
        onHighlight={vi.fn()}
      />
    );
    const row = screen.getByRole("button", { pressed: true });
    expect(row).toHaveClass("chrome-row-live");
    expect(row).not.toHaveClass("chrome-row-member");
    expect(screen.getByText("On stream")).toBeInTheDocument();
  });

  it("paints a paid message over a member's plate", () => {
    renderRow(
      <ChatMessage
        message={message({
          amountText: "$5.00",
          authorRoles: ["member"],
          kind: "paid",
        })}
      />
    );
    const item = screen.getByRole("listitem");
    expect(item).toHaveAttribute("data-row-tint", "paid");
    expect(screen.getByText("$5.00")).toBeInTheDocument();
  });

  it("never makes a removed message a button", () => {
    renderRow(
      <ChatMessage
        message={message({ deleted: true })}
        onHighlight={vi.fn()}
        removal={{ kind: "removed" }}
      />
    );
    expect(
      screen.queryByRole("button", { name: /Maya Chen on YouTube/u })
    ).toBeNull();
    expect(screen.getByText("Removed")).toBeInTheDocument();
  });

  it("says why a show failed on the row's own line", () => {
    renderRow(
      <ChatMessage
        highlight={{ phase: "failed", reason: "Studio didn't answer." }}
        message={message()}
        onHighlight={vi.fn()}
      />
    );
    expect(screen.getByText("Failed")).toBeInTheDocument();
    expect(screen.getByText("Studio didn't answer.")).toBeInTheDocument();
  });
});

describe("chatMessageMenu", () => {
  it("toggles the stream, replies, copies, and removes last", () => {
    const items = chatMessageMenu(message(), {
      highlightPhase: "live",
      highlightable: true,
      onRemoveFromChat: vi.fn(),
      onReply: vi.fn(),
    });
    expect(items.map((item) => item.label)).toEqual([
      "Take off stream",
      "Reply",
      "Copy",
      "Remove from chat",
    ]);
    expect(items.at(-1)?.destructive).toBe(true);
  });

  it("keeps Remove from chat, disabled, when only a reason is given", () => {
    const remove = chatMessageMenu(message(), {
      highlightPhase: "idle",
      highlightable: false,
      removeFromChatReason: "Reconnect Twitch to remove messages.",
    }).find((item) => item.id === "remove-from-chat");
    expect(remove).toMatchObject({
      disabled: true,
      disabledReason: "Reconnect Twitch to remove messages.",
    });
  });
});

describe("chatMessageMentions", () => {
  it("finds the streamer's handle, with or without its @", () => {
    expect(
      chatMessageMentions(message({ text: "hi @NightOwlStudio!" }), [
        "@nightowlstudio",
      ])
    ).toBe(true);
    expect(
      chatMessageMentions(message({ kind: "system", text: "@nightowl" }), [
        "nightowl",
      ])
    ).toBe(false);
  });
});

describe("chatMessageInitials", () => {
  it("takes the first letters of up to two words", () => {
    expect(chatMessageInitials("Next Session Viewer")).toBe("NS");
    expect(chatMessageInitials("nightowl_jonas")).toBe("N");
    expect(chatMessageInitials("  ")).toBe("?");
  });
});
