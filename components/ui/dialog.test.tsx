import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  dialogContentVariants,
} from "@/components/ui/dialog";

describe("Dialog", () => {
  it("has four widths and one height rule", () => {
    const widths = {
      lg: "sm:max-w-xl",
      md: "sm:max-w-md",
      sm: "sm:max-w-sm",
      xl: "sm:max-w-3xl",
    } as const;
    for (const [size, width] of Object.entries(widths)) {
      const classes = dialogContentVariants({
        size: size as keyof typeof widths,
      });
      expect(classes).toContain(width);
      expect(classes).toContain("max-h-[calc(100vh-2rem)]");
      expect(classes).toContain("flex-col");
      expect(classes).toContain("rounded-panel border glass-float-dialog p-5");
    }
    expect(dialogContentVariants()).toContain("sm:max-w-md");
  });

  it("opens on the dialog tier over an overlay with no backdrop blur", async () => {
    render(
      <Dialog defaultOpen>
        <DialogContent size="lg">
          <DialogHeader>
            <DialogTitle>Go Live</DialogTitle>
            <DialogDescription>Choose where to stream.</DialogDescription>
          </DialogHeader>
          <DialogBody>Destinations</DialogBody>
          <DialogFooter>Footer</DialogFooter>
        </DialogContent>
      </Dialog>
    );
    const dialog = await screen.findByRole("dialog", { name: "Go Live" });
    expect(dialog).toHaveAttribute("data-size", "lg");
    expect(dialog).toHaveClass("glass-float-dialog", "sm:max-w-xl");
    expect(screen.getByText("Destinations")).toHaveAttribute(
      "data-slot",
      "dialog-body"
    );
    expect(screen.getByRole("button", { name: "Close" })).toBeInTheDocument();
    for (const element of document.querySelectorAll(
      "[data-slot=dialog-overlay], [data-slot=dialog-content]"
    )) {
      expect(element.className).not.toContain("backdrop-blur");
    }
  });
});
