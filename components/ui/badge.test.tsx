import { readFileSync } from "node:fs";
import path from "node:path";

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Badge } from "@/components/ui/badge";

describe("Badge", () => {
  it("is a glass tag on the tag radius", () => {
    render(<Badge variant="outline">9:16</Badge>);
    const badge = screen.getByText("9:16");
    expect(badge).toHaveAttribute("data-slot", "badge");
    expect(badge).toHaveAttribute("data-variant", "outline");
    expect(badge.className).toContain("glass-chip");
    expect(
      readFileSync(path.join(process.cwd(), "components/ui/badge.tsx"), "utf-8")
    ).toContain("rounded-tag");
  });

  it("keeps a status chip's tone in its dot, never in its text", () => {
    render(<Badge variant="success">Connected</Badge>);
    const badge = screen.getByText("Connected");
    expect(badge.className).toContain("tone-success");
    expect(badge.className).toContain("before:glass-dot");
    expect(badge.className).toContain("text-foreground");
  });

  it("gives a truncating child a line box that holds Segoe UI's descenders", () => {
    // 11 px Segoe UI is 14.6 px from ascent to descent: a 16 px line fits it
    // inside the 20 px chip, and `leading-none` (11 px) cut the "g".
    render(<Badge variant="outline">Recording</Badge>);
    const badge = screen.getByText("Recording");
    expect(badge).toHaveClass("h-5", "leading-4");
    expect(badge).not.toHaveClass("leading-none");
  });

  it("renders another element through render, as a button chip", () => {
    render(
      <Badge
        // oxlint-disable-next-line jsx-a11y/control-has-associated-label -- Base UI renders the label into it.
        render={<button type="button" />}
        variant="neutral"
      >
        12 new
      </Badge>
    );
    const button = screen.getByRole("button", { name: "12 new" });
    expect(button).toHaveAttribute("data-slot", "badge");
    expect(button.className).toContain("glass-chip");
  });
});
