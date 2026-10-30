import { readFileSync } from "node:fs";
import path from "node:path";

import type { ReactElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { MicrophoneIcon } from "@/components/icons";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// One primitive per kind of feedback: Alert is the inline status row.

const openingTag = (markup: string, slot: string): string =>
  new RegExp(`<[^>]*data-slot="${slot}"[^>]*>`, "u").exec(markup)?.[0] ?? "";

const alertTag = (element: ReactElement): string =>
  openingTag(renderToStaticMarkup(element), "alert");

const TONES = [
  "default",
  "quiet",
  "locked",
  "destructive",
  "warning",
  "success",
] as const;

const SVG = /<svg/gu;
const DIV_TAGS = /<div[^>]*>|<\/div>/gu;

describe("Alert", () => {
  it("is assertive only when destructive; every other tone is a polite status", () => {
    expect(alertTag(<Alert variant="destructive" />)).toContain('role="alert"');
    for (const variant of TONES.filter((tone) => tone !== "destructive")) {
      const tag = alertTag(<Alert variant={variant} />);
      expect(tag, variant).toContain('role="status"');
      expect(tag, variant).toContain(`data-variant="${variant}"`);
    }
    expect(alertTag(<Alert />)).toContain('role="status"');
  });

  it("keeps an explicit role (a card that is a group)", () => {
    expect(alertTag(<Alert role="group" />)).toContain('role="group"');
  });

  it("draws its tone's own icon once, in one weight, hidden from screen readers", () => {
    for (const variant of TONES) {
      const markup = renderToStaticMarkup(
        <Alert variant={variant}>
          <AlertTitle>Line</AlertTitle>
        </Alert>
      );
      expect(markup.match(SVG), variant).toHaveLength(1);
      expect(openingTag(markup, "alert-icon"), variant).toContain(
        'aria-hidden="true"'
      );
    }
    // Six tones, five glyphs: default and quiet share the info mark.
    const glyphs = new Set(
      (["default", "locked", "destructive", "warning", "success"] as const).map(
        (variant) =>
          renderToStaticMarkup(<Alert variant={variant} />).replaceAll(
            DIV_TAGS,
            ""
          )
      )
    );
    expect(glyphs.size).toBe(5);
  });

  it("takes a subject's own mark, or none", () => {
    const withMic = renderToStaticMarkup(<Alert icon={MicrophoneIcon} />);
    expect(withMic.match(SVG)).toHaveLength(1);
    expect(withMic).not.toEqual(renderToStaticMarkup(<Alert />));
    expect(renderToStaticMarkup(<Alert icon={null} />)).not.toContain("<svg");
  });

  it("reads a lone title as a message and a titled description as a heading", () => {
    const title = openingTag(
      renderToStaticMarkup(
        <Alert>
          <AlertTitle>One line</AlertTitle>
        </Alert>
      ),
      "alert-title"
    );
    expect(title).toContain("font-normal");
    expect(title).toContain(
      "group-has-data-[slot=alert-description]/alert:font-medium"
    );
    const both = renderToStaticMarkup(
      <Alert>
        <AlertTitle>Heading</AlertTitle>
        <AlertDescription>Body</AlertDescription>
      </Alert>
    );
    expect(both).toContain('data-slot="alert-description"');
  });

  it("mutes the quiet and locked lines in the variant, not per call site", () => {
    const title = openingTag(
      renderToStaticMarkup(
        <Alert variant="quiet">
          <AlertTitle />
        </Alert>
      ),
      "alert-title"
    );
    expect(title).toContain(
      "group-data-[variant=quiet]/alert:text-muted-foreground"
    );
    expect(title).toContain(
      "group-data-[variant=locked]/alert:text-muted-foreground"
    );
  });

  it("stays a flush row: a tint, the row radius, no border and no shadow", () => {
    const tag = alertTag(<Alert variant="warning" />);
    for (const token of ["rounded-row", "px-3", "py-2.5", "bg-warning/10"]) {
      expect(tag).toContain(token);
    }
    expect(tag).not.toMatch(/\bborder\b|shadow/u);
    const source = readFileSync(
      path.join(process.cwd(), "components/ui/alert.tsx"),
      "utf-8"
    );
    expect(source).not.toMatch(/\bshadow|rounded-(?:lg|xl|2xl|panel)/u);
  });
});
