import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { ConfirmDialog } from "@/components/confirm-dialog";
import type { ConfirmDialogProps } from "@/components/confirm-dialog";

const props = (
  overrides: Partial<ConfirmDialogProps> = {}
): ConfirmDialogProps => ({
  confirmLabel: "Delete takeover",
  description: "Its image file is deleted from this computer.",
  onCancel: vi.fn(),
  onConfirm: vi.fn(),
  open: true,
  testId: "confirm",
  title: "Delete takeover?",
  ...overrides,
});

describe("ConfirmDialog", () => {
  it("is an alert dialog with no close button, the safe answer focused", async () => {
    render(<ConfirmDialog {...props()} />);
    const dialog = await screen.findByTestId("confirm-dialog");
    expect(dialog).toHaveAttribute("role", "alertdialog");
    expect(dialog).toHaveAccessibleName("Delete takeover?");
    expect(dialog).toHaveAccessibleDescription(
      "Its image file is deleted from this computer."
    );
    expect(screen.queryByRole("button", { name: "Close" })).toBeNull();
    const cancel = screen.getByTestId("confirm-cancel");
    expect(cancel).toHaveTextContent("Cancel");
    expect(cancel).toHaveAttribute("data-variant", "ghost");
    await waitFor(() => expect(cancel).toHaveFocus());
    expect(screen.getByTestId("confirm-confirm")).toHaveAttribute(
      "data-variant",
      "destructive"
    );
  });

  it("cancels from the safe button and from Escape, never confirming", async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    const onConfirm = vi.fn();
    render(
      <ConfirmDialog
        {...props({ cancelLabel: "Keep it", onCancel, onConfirm })}
      />
    );
    const cancel = await screen.findByTestId("confirm-cancel");
    expect(cancel).toHaveTextContent("Keep it");
    await user.click(cancel);
    expect(onCancel).toHaveBeenCalledOnce();
    await user.keyboard("{Escape}");
    expect(onCancel).toHaveBeenCalledTimes(2);
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it("confirms from the destructive button only, and stays open for its owner", async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    const onConfirm = vi.fn();
    const { rerender } = render(
      <ConfirmDialog {...props({ onCancel, onConfirm })} />
    );
    await user.click(await screen.findByTestId("confirm-confirm"));
    expect(onConfirm).toHaveBeenCalledOnce();
    expect(onCancel).not.toHaveBeenCalled();
    // Controlled: still open until the owner drops `open`.
    expect(screen.getByTestId("confirm-dialog")).toBeInTheDocument();
    rerender(
      <ConfirmDialog {...props({ onCancel, onConfirm, open: false })} />
    );
    await waitFor(() =>
      expect(screen.queryByTestId("confirm-dialog")).toBeNull()
    );
  });

  it("locks the destructive answer while the owner says so", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    render(
      <ConfirmDialog
        {...props({
          confirmDisabled: true,
          confirmLabel: "Deleting…",
          onConfirm,
        })}
      />
    );
    const confirm = await screen.findByTestId("confirm-confirm");
    expect(confirm).toBeDisabled();
    expect(confirm).toHaveTextContent("Deleting…");
    await user.click(confirm);
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it("offers a consequential step that destroys nothing in the default fill", async () => {
    render(<ConfirmDialog {...props({ confirmVariant: "default" })} />);
    expect(await screen.findByTestId("confirm-confirm")).toHaveAttribute(
      "data-variant",
      "default"
    );
  });
});
