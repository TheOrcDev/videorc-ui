import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Field, FieldLabel } from "@/components/ui/field";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const panes = (variant?: "default" | "line") => (
  <Tabs defaultValue="chat">
    <TabsList aria-label="Panes" variant={variant}>
      <TabsTrigger value="chat">Chat</TabsTrigger>
      <TabsTrigger value="activity">Activity</TabsTrigger>
    </TabsList>
    <TabsContent value="chat">Chat pane</TabsContent>
    <TabsContent value="activity">Activity pane</TabsContent>
  </Tabs>
);

describe("Tabs", () => {
  it("draws the selected tab as the chrome plate, keyed off data-active", () => {
    render(panes());
    const chat = screen.getByRole("tab", { name: "Chat" });
    expect(chat).toHaveAttribute("data-active");
    expect(chat.className).toContain(
      "group-data-[variant=default]/tabs-list:data-active:chrome-plate"
    );
    expect(chat.className).not.toContain("data-[state=active]");
    expect(screen.getByRole("tablist")).toHaveAttribute(
      "data-variant",
      "default"
    );
    expect(screen.getByRole("tablist").className).toContain("h-control");
  });

  it("underlines the selected tab in the line variant, with no plate", () => {
    render(panes("line"));
    const list = screen.getByRole("tablist");
    expect(list).toHaveAttribute("data-variant", "line");
    expect(list.className).not.toContain("ring-border");
    expect(screen.getByRole("tab", { name: "Chat" }).className).toContain(
      "group-data-[variant=line]/tabs-list:data-active:after:opacity-100"
    );
  });

  it("switches the view as the arrow keys move", async () => {
    render(panes());
    const chat = screen.getByRole("tab", { name: "Chat" });
    chat.focus();
    fireEvent.keyDown(chat, { key: "ArrowRight" });
    // Base UI moves focus in a microtask; the move activates the tab.
    await waitFor(() =>
      expect(screen.getByRole("tab", { name: "Activity" })).toHaveAttribute(
        "data-active"
      )
    );
    expect(screen.getByText("Activity pane")).toBeVisible();
  });

  it("is named by its Field label, unless it names itself", () => {
    render(
      <Field>
        <FieldLabel>Pane</FieldLabel>
        <Tabs defaultValue="chat">
          <TabsList>
            <TabsTrigger value="chat">Chat</TabsTrigger>
          </TabsList>
        </Tabs>
      </Field>
    );
    const label = document.querySelector('[data-slot="field-label"]');
    expect(label?.id).toBeTruthy();
    expect(screen.getByRole("tablist")).toHaveAttribute(
      "aria-labelledby",
      label?.id
    );
  });
});
