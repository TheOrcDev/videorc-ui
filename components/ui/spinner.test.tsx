import { readFileSync } from "node:fs";
import path from "node:path";

import type { ReactElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { Spinner } from "@/components/ui/spinner";

const spinnerTag = (element: ReactElement): string =>
  /<[^>]*data-slot="spinner"[^>]*>/u.exec(renderToStaticMarkup(element))?.[0] ??
  "";

describe("Spinner", () => {
  it("announces itself as a status, named Loading unless told otherwise", () => {
    const tag = spinnerTag(<Spinner />);
    expect(tag).toContain('role="status"');
    expect(tag).toContain('aria-label="Loading"');
    expect(tag).toContain("animate-spin");
    expect(spinnerTag(<Spinner aria-label="Syncing" />)).toContain(
      'aria-label="Syncing"'
    );
  });

  it("stays silent beside its own words", () => {
    const tag = spinnerTag(<Spinner aria-hidden />);
    expect(tag).toContain('aria-hidden="true"');
    expect(tag).not.toContain("role=");
    expect(tag).not.toContain("aria-label");
  });

  it("takes its size from the slot unless a class sets one", () => {
    expect(spinnerTag(<Spinner />)).not.toMatch(/class="[^"]*size-/u);
    expect(spinnerTag(<Spinner className="size-3.5" />)).toContain("size-3.5");
  });

  it("draws the registry's spinner glyph", () => {
    const source = readFileSync(
      path.join(process.cwd(), "components/ui/spinner.tsx"),
      "utf-8"
    );
    expect(source).toContain('from "@/components/icons"');
  });
});
