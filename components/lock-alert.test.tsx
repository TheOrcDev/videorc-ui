import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import {
  LockAlert,
  OFFLINE_LOCK_REASON,
  OfflineAlert,
  SESSION_LOCK_REASON,
  SessionLockAlert,
  sessionLockReason,
} from "@/components/lock-alert";

// A lock says why in one line and offers at most one action. Premium features
// stay on screen behind it, so the lock is a row, never a replacement for the
// page.

const PREMIUM_URL = "https://www.videorc.com/premium";

describe("LockAlert", () => {
  it("is a polite locked line: the lock, the reason, no action", () => {
    render(<LockAlert reason="Clean cut is part of Videorc Premium." />);
    const alert = screen.getByRole("status");
    expect(alert).toHaveAttribute("data-variant", "locked");
    expect(alert.querySelectorAll("svg")).toHaveLength(1);
    expect(alert).toHaveTextContent(
      /^Clean cut is part of Videorc Premium\.$/u
    );
    expect(screen.queryByRole("button")).toBeNull();
    expect(screen.queryByRole("link")).toBeNull();
  });

  it("opens Premium through the app's opener when it has one", async () => {
    const user = userEvent.setup();
    const open = vi.fn();
    render(
      <LockAlert
        action={{ kind: "view-premium", onClick: open, url: PREMIUM_URL }}
        data-testid="lock"
        reason="Live captions are part of Videorc Premium."
      />
    );
    expect(screen.getByRole("status")).toHaveAttribute("data-testid", "lock");
    const buttons = screen.getAllByRole("button");
    expect(buttons).toHaveLength(1);
    expect(buttons[0]).toHaveTextContent("View Premium");
    await user.click(buttons[0] as HTMLElement);
    expect(open).toHaveBeenCalledWith(PREMIUM_URL);
  });

  it("links to Premium in a new tab without an opener", () => {
    render(
      <LockAlert
        action={{ kind: "view-premium", url: PREMIUM_URL }}
        reason="Live captions are part of Videorc Premium."
      />
    );
    const link = screen.getByRole("link", { name: "View Premium" });
    expect(link).toHaveAttribute("href", PREMIUM_URL);
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("starts sign-in from its one action", async () => {
    const user = userEvent.setup();
    const signIn = vi.fn();
    render(
      <LockAlert
        action={{ kind: "sign-in", onClick: signIn }}
        reason="Sign in to use Buddy."
      />
    );
    const button = screen.getByRole("button", { name: "Sign in" });
    await user.click(button);
    expect(signIn).toHaveBeenCalledOnce();
  });

  it("takes the action's own words", () => {
    render(
      <LockAlert
        action={{ kind: "sign-in", label: "Sign in again", onClick: vi.fn() }}
        reason="Your session ended."
      />
    );
    expect(
      screen.getByRole("button", { name: "Sign in again" })
    ).toBeInTheDocument();
  });
});

describe("SessionLockAlert and OfflineAlert", () => {
  it("say the one session-lock wording", () => {
    render(<SessionLockAlert />);
    const alert = screen.getByRole("status");
    expect(alert).toHaveTextContent(SESSION_LOCK_REASON);
    expect(alert).toHaveAttribute("data-variant", "locked");
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("name what a session locks", () => {
    render(<SessionLockAlert locks="Destinations and stream details" />);
    expect(screen.getByRole("status")).toHaveTextContent(
      sessionLockReason("Destinations and stream details")
    );
    expect(sessionLockReason("Destinations")).toMatch(
      /^Destinations are locked while you're recording or live\./u
    );
  });

  it("say the one offline wording", () => {
    render(<OfflineAlert />);
    expect(screen.getByRole("status")).toHaveTextContent(OFFLINE_LOCK_REASON);
  });
});
