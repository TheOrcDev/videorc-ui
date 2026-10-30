import { readFileSync } from "node:fs";
import path from "node:path";

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

describe("Accordion", () => {
  it("opens several items at once with multiple and an array value", () => {
    render(
      <Accordion defaultValue={["youtube"]} multiple>
        <AccordionItem value="youtube">
          <AccordionTrigger>YouTube</AccordionTrigger>
          <AccordionContent>Title and privacy for YouTube.</AccordionContent>
        </AccordionItem>
        <AccordionItem value="twitch">
          <AccordionTrigger>Twitch</AccordionTrigger>
          <AccordionContent>Title and category for Twitch.</AccordionContent>
        </AccordionItem>
      </Accordion>
    );
    const youtube = screen.getByRole("button", { name: "YouTube" });
    const twitch = screen.getByRole("button", { name: "Twitch" });
    expect(youtube).toHaveAttribute("aria-expanded", "true");
    expect(youtube).toHaveAttribute("data-panel-open");
    fireEvent.click(twitch);
    expect(twitch).toHaveAttribute("aria-expanded", "true");
    expect(youtube).toHaveAttribute("aria-expanded", "true");
  });

  it("animates colours and the panel height only, never transition-all", () => {
    const source = readFileSync(
      path.join(process.cwd(), "components/ui/accordion.tsx"),
      "utf-8"
    );
    expect(source).not.toContain("transition-all");
    expect(source).not.toContain("data-[state=");
  });
});
