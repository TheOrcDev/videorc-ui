import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const DeleteRecording = ({
  onConfirm,
  onOpenChange,
}: {
  onConfirm?: () => void;
  onOpenChange?: (open: boolean) => void;
}) => (
  <AlertDialog defaultOpen onOpenChange={onOpenChange}>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Delete recording?</AlertDialogTitle>
        <AlertDialogDescription>
          The recording and its markers are deleted.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <input aria-label="Type the recording's name" />
      <AlertDialogFooter>
        <AlertDialogCancel>Cancel</AlertDialogCancel>
        <AlertDialogAction onClick={onConfirm} variant="destructive">
          Delete recording
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);

describe("AlertDialog", () => {
  it("focuses Cancel on open, even after a control in the body", async () => {
    render(<DeleteRecording />);
    const cancel = await screen.findByRole("button", { name: "Cancel" });
    await waitFor(() => expect(cancel).toHaveFocus());
  });

  it("shares the dialog anatomy and has no close button", async () => {
    render(<DeleteRecording />);
    const dialog = await screen.findByRole("alertdialog", {
      name: "Delete recording?",
    });
    expect(dialog).toHaveClass("glass-float-dialog", "rounded-panel", "p-5");
    expect(screen.queryByRole("button", { name: "Close" })).toBeNull();
    expect(screen.getByRole("button", { name: "Cancel" })).toHaveAttribute(
      "data-variant",
      "ghost"
    );
  });

  it("leaves closing to the owner when the action runs", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    const onOpenChange = vi.fn();
    render(
      <DeleteRecording onConfirm={onConfirm} onOpenChange={onOpenChange} />
    );
    await user.click(
      await screen.findByRole("button", { name: "Delete recording" })
    );
    expect(onConfirm).toHaveBeenCalledOnce();
    expect(onOpenChange).not.toHaveBeenCalled();
    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onOpenChange).toHaveBeenCalledWith(false, expect.anything());
  });
});
