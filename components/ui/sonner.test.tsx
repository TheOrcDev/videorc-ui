import { act, render, screen } from "@testing-library/react";
import { toast } from "sonner";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { Toaster } from "@/components/ui/sonner";

// sonner reads the reduced-motion and colour-scheme queries; jsdom has the
// property but no implementation.
beforeEach(() => {
  vi.stubGlobal("matchMedia", (query: string) => ({
    addEventListener: vi.fn(),
    addListener: vi.fn(),
    dispatchEvent: vi.fn(),
    matches: false,
    media: query,
    onchange: null,
    removeEventListener: vi.fn(),
    removeListener: vi.fn(),
  }));
});

afterEach(() => {
  act(() => {
    toast.dismiss();
  });
  vi.unstubAllGlobals();
});

describe("Toaster", () => {
  it("lets every toast be dismissed, by a labelled close button", async () => {
    render(<Toaster />);
    act(() => {
      toast.success("Recording saved");
    });
    expect(await screen.findByText("Recording saved")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Dismiss notification" })
    ).toBeInTheDocument();
  });

  it("drops the close button when asked", async () => {
    render(<Toaster closeButton={false} />);
    act(() => {
      toast("Streaming to Twitch stopped");
    });
    expect(
      await screen.findByText("Streaming to Twitch stopped")
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Dismiss notification" })
    ).toBeNull();
  });
});
