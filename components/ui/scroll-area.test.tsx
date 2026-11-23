import { render } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it } from "vitest";

import { ScrollArea } from "@/components/ui/scroll-area";

describe("ScrollArea", () => {
  it("hands viewportRef the viewport that scrolls, and ref the root", () => {
    const root = createRef<HTMLDivElement>();
    const viewport = createRef<HTMLDivElement>();
    render(
      <ScrollArea ref={root} viewportRef={viewport}>
        <p>People</p>
      </ScrollArea>
    );
    expect(viewport.current).toHaveAttribute(
      "data-slot",
      "scroll-area-viewport"
    );
    expect(root.current).toHaveAttribute("data-slot", "scroll-area");
  });
});
