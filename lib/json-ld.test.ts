import { describe, expect, it } from "vitest";

import {
  docsCrumbs,
  docsPageJsonLd,
  serializeJsonLd,
  websiteJsonLd,
} from "@/lib/json-ld";
import socialImages from "@/lib/social-images.json";

const titles: Record<string, string | undefined> = {
  "/docs/components": "Components",
  "/docs/components/button": "Button",
  "/docs/concepts/theme": "Theme",
};
const titleFor = (pathname: string) => titles[pathname];

describe("docsCrumbs", () => {
  it("walks from Docs through the section to the page", () => {
    expect(docsCrumbs("/docs/components/button", titleFor)).toEqual([
      { name: "Docs", pathname: "/docs" },
      { name: "Components", pathname: "/docs/components" },
      { name: "Button", pathname: "/docs/components/button" },
    ]);
  });

  it("skips a level that has no page of its own", () => {
    expect(docsCrumbs("/docs/concepts/theme", titleFor)).toEqual([
      { name: "Docs", pathname: "/docs" },
      { name: "Theme", pathname: "/docs/concepts/theme" },
    ]);
  });
});

describe("docsPageJsonLd", () => {
  it("describes the article, its card and its breadcrumb trail", () => {
    const data = docsPageJsonLd({
      crumbs: docsCrumbs("/docs/components/button", titleFor),
      description: "Desktop-sized buttons.",
      pathname: "/docs/components/button",
      title: "Button",
    });
    expect(data["@graph"]).toEqual([
      expect.objectContaining({
        "@type": "TechArticle",
        headline: "Button",
        image: `https://ui.videorc.com${socialImages["/docs/components/button"].url}`,
        url: "https://ui.videorc.com/docs/components/button",
      }),
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          expect.objectContaining({ name: "Docs", position: 1 }),
          expect.objectContaining({
            item: "https://ui.videorc.com/docs/components",
            position: 2,
          }),
          expect.objectContaining({ name: "Button", position: 3 }),
        ],
      },
    ]);
  });
});

describe("serializeJsonLd", () => {
  it("never lets a string close the script tag", () => {
    const json = serializeJsonLd({
      ...websiteJsonLd(),
      name: "</script><script>alert(1)</script>",
    });
    expect(json).not.toContain("<");
    expect(JSON.parse(json).name).toBe("</script><script>alert(1)</script>");
  });
});
