import { describe, expect, it } from "vitest";

import { cn } from "@/lib/utils";

describe("cn", () => {
  it("keeps a type token beside a text colour", () => {
    expect(cn("text-meta text-muted-foreground")).toBe(
      "text-meta text-muted-foreground"
    );
    expect(cn("text-label text-subtle")).toBe("text-label text-subtle");
  });

  it("lets a call site override a desktop size or a radius tier", () => {
    expect(cn("h-control", "h-auto")).toBe("h-auto");
    expect(cn("size-control px-gutter", "size-6")).toBe("px-gutter size-6");
    expect(cn("rounded-tag", "rounded-full")).toBe("rounded-full");
    expect(cn("rounded-panel", "rounded-row")).toBe("rounded-row");
  });

  it("merges like clsx and tailwind-merge otherwise", () => {
    expect(cn("px-2", false, ["py-1", { hidden: true }], "px-4")).toBe(
      "py-1 hidden px-4"
    );
  });
});
