import { describe, expect, it } from "vitest";

import {
  segmentedItemClassName,
  segmentedTrackClassName,
  segmentedTrackVariantClassName,
  tabsListVariants,
  tabsTriggerBaseClassName,
} from "@/components/ui/tabs-variants";

describe("tabs-variants", () => {
  it("keeps the bare segmented look free of rules keyed off a Tabs root", () => {
    for (const className of [
      segmentedTrackClassName,
      segmentedTrackVariantClassName,
      segmentedItemClassName,
    ]) {
      expect(className).not.toContain("/tabs:");
    }
  });

  it("builds the Tabs track and trigger on the bare look, plus the Tabs rules", () => {
    const list = tabsListVariants({ variant: "default" });
    expect(list).toContain(segmentedTrackClassName);
    expect(list).toContain(segmentedTrackVariantClassName);
    expect(list).toContain("group-data-horizontal/tabs:h-control");
    expect(tabsTriggerBaseClassName.startsWith(segmentedItemClassName)).toBe(
      true
    );
    expect(tabsTriggerBaseClassName).toContain(
      "group-data-vertical/tabs:w-full"
    );
  });
});
