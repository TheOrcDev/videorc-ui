import { readFileSync } from "node:fs";
import path from "node:path";

import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import * as EmptyModule from "@/components/ui/empty";
import { Empty, EmptyDescription, EmptyTitle } from "@/components/ui/empty";

const openingTag = (markup: string, slot: string): string =>
  new RegExp(`<[^>]*data-slot="${slot}"[^>]*>`, "u").exec(markup)?.[0] ?? "";

describe("Empty", () => {
  it("has no media tile", () => {
    expect(Object.keys(EmptyModule)).not.toContain("EmptyMedia");
    const source = readFileSync(
      path.join(process.cwd(), "components/ui/empty.tsx"),
      "utf-8"
    );
    expect(source).not.toMatch(/text-(?:lg|base)|rounded-|border-dashed/u);
  });

  it("is short muted 14 px text with an optional 14 px / 500 title, centred", () => {
    const markup = renderToStaticMarkup(
      <Empty>
        <EmptyTitle>No recordings yet</EmptyTitle>
        <EmptyDescription>Record a session to see it here.</EmptyDescription>
      </Empty>
    );
    expect(openingTag(markup, "empty")).toContain("text-center");
    const title = openingTag(markup, "empty-title");
    expect(title).toContain("text-sm");
    expect(title).toContain("font-medium");
    expect(title).not.toMatch(/text-(?:lg|base)/u);
    const description = openingTag(markup, "empty-description");
    expect(description).toContain("text-sm");
    expect(description).toContain("text-muted-foreground");
    expect(markup).not.toMatch(/border-dashed|<svg|<img/u);
  });
});
