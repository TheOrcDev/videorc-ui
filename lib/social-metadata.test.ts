import { describe, expect, it } from "vitest";

import { siteConfig } from "@/lib/site";
import socialImages from "@/lib/social-images.json";
import { getPageMetadata } from "@/lib/social-metadata";

describe("page metadata", () => {
  it("uses the homepage's descriptive title without adding a second brand", () => {
    const metadata = getPageMetadata({ pathname: "/", title: siteConfig.name });
    expect(metadata.title).toEqual({ absolute: siteConfig.title });
    expect(metadata.openGraph?.title).toBe(siteConfig.title);
    expect(metadata.twitter?.title).toBe(siteConfig.title);
  });

  it("gives a nested page its own absolute canonical and social URL", () => {
    const metadata = getPageMetadata({
      description: "Desktop-sized buttons.",
      pathname: "/docs/components/button",
      title: "Button for React",
    });
    const canonical = "https://ui.videorc.com/docs/components/button";
    expect(metadata.alternates?.canonical).toBe(canonical);
    expect(metadata.openGraph?.url).toBe(canonical);
    expect(metadata.title).toEqual({
      absolute: "Button for React — videorc/ui",
    });
    expect(metadata.description).toBe("Desktop-sized buttons.");
    expect(metadata.openGraph?.description).toBe(metadata.description);
    expect(metadata.twitter?.description).toBe(metadata.description);
  });

  it("shares the page's own card, with its alt text, on both networks", () => {
    const metadata = getPageMetadata({
      pathname: "/docs/components/button",
      title: "Button for React",
    });
    const card = socialImages["/docs/components/button"];
    const url = new URL(card.url, siteConfig.url).href;
    expect(metadata.openGraph?.images).toEqual([
      { alt: card.alt, height: 630, url, width: 1200 },
    ]);
    expect(metadata.twitter?.images).toEqual([{ alt: card.alt, url }]);
  });

  it("falls back to the homepage's card for a page without one", () => {
    const metadata = getPageMetadata({
      pathname: "/docs/not-captured-yet",
      title: "New page",
    });
    expect(metadata.twitter?.images).toEqual([
      {
        alt: socialImages["/"].alt,
        url: new URL(socialImages["/"].url, siteConfig.url).href,
      },
    ]);
  });
});
