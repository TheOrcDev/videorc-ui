import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

import { siteConfig } from "../lib/site";
import socialImages from "../lib/social-images.json" with { type: "json" };
import type { SocialImage } from "../lib/social-metadata";
import { publicPages } from "./routes";

const images: Record<string, SocialImage | undefined> = socialImages;

const canonicalFor = (pathname: string): string =>
  pathname === "/" ? siteConfig.url : new URL(pathname, siteConfig.url).href;

const readInitialHead = (page: Page, html: string) =>
  page.evaluate((markup) => {
    // DOMParser runs no scripts: this is the head a crawler reads.
    const { head } = new DOMParser().parseFromString(markup, "text/html");
    return {
      canonical: head
        .querySelector('link[rel="canonical"]')
        ?.getAttribute("href"),
      meta: Object.fromEntries(
        Array.from(head.querySelectorAll("meta"), (element) => [
          element.getAttribute("property") ?? element.getAttribute("name"),
          element.getAttribute("content"),
        ])
      ),
      title: head.querySelector("title")?.textContent,
    };
  }, html);

for (const pathname of publicPages) {
  test(`${pathname} shows a social crawler its complete metadata`, async ({
    page,
    request,
  }) => {
    const response = await request.get(pathname, {
      headers: { "user-agent": "Twitterbot/1.0" },
    });
    expect(response.status()).toBe(200);
    const head = await readInitialHead(page, await response.text());
    const meta = (key: string) => head.meta[key];
    const canonical = canonicalFor(pathname);
    expect(head.canonical).toBe(canonical);
    expect(meta("og:url")).toBe(canonical);
    const { title } = head;
    expect(title).toContain(siteConfig.name);
    expect(meta("og:title")).toBe(title);
    expect(meta("twitter:title")).toBe(title);
    const description = meta("description");
    expect(description?.length).toBeGreaterThan(20);
    expect(meta("og:description")).toBe(description);
    expect(meta("twitter:description")).toBe(description);
    const image = images[pathname];
    if (!image) {
      throw new Error(`No social image for ${pathname}`);
    }
    const imageUrl = new URL(image.url, siteConfig.url).href;
    expect(meta("og:image")).toBe(imageUrl);
    expect(meta("twitter:image")).toBe(imageUrl);
    expect(meta("og:image:alt")).toBe(image.alt);
    expect(meta("twitter:image:alt")).toBe(image.alt);
    expect(meta("og:image:width")).toBe("1200");
    expect(meta("og:image:height")).toBe("630");
    expect(meta("twitter:card")).toBe("summary_large_image");
    const asset = await request.get(image.url);
    expect(asset.status()).toBe(200);
    expect(asset.headers()["content-type"]).toContain("image/png");
  });
}

const titles = [
  { pathname: "/", title: siteConfig.title },
  {
    pathname: "/docs/components/button",
    title: "Button for React — videorc/ui",
  },
  {
    pathname: "/docs/blocks/stream-manager",
    title: "Stream Manager for React — videorc/ui",
  },
  {
    pathname: "/docs/components",
    title: "Desktop app components for React — videorc/ui",
  },
  {
    pathname: "/docs/hooks/use-theme-toggle",
    title: "useThemeToggle — videorc/ui",
  },
];

for (const { pathname, title } of titles) {
  test(`${pathname} has one title for search and social`, async ({ page }) => {
    await page.goto(pathname);
    await expect(page).toHaveTitle(title);
    await Promise.all(
      ['meta[property="og:title"]', 'meta[name="twitter:title"]'].map(
        (selector) =>
          expect(page.locator(selector)).toHaveAttribute("content", title)
      )
    );
  });
}

test("an SEO title leaves the visible heading alone", async ({ page }) => {
  await page.goto("/docs/components");
  await expect(
    page.getByRole("heading", { exact: true, level: 1, name: "Components" })
  ).toBeVisible();
});

test("each component shares its own card", async ({ page }) => {
  const shared = new Set<string>();
  for (const slug of ["button", "dialog", "select"]) {
    // One page, so the visits run in order.
    // oxlint-disable-next-line eslint/no-await-in-loop
    await page.goto(`/docs/components/${slug}`);
    // oxlint-disable-next-line eslint/no-await-in-loop
    const url = await page
      .locator('meta[property="og:image"]')
      .getAttribute("content");
    expect(url).toMatch(
      new RegExp(`/og/components-${slug}-[a-f0-9]{12}\\.png$`, "u")
    );
    shared.add(url ?? "");
  }
  expect(shared.size).toBe(3);
});

test("the capture routes are 404 in production and stay out of the sitemap", async ({
  request,
}) => {
  const preview = await request.get("/social-preview/home");
  expect(preview.status()).toBe(404);
  const catalog = await request.get("/api/social-cards");
  expect(catalog.status()).toBe(404);
  const response = await request.get("/sitemap.xml");
  const sitemap = await response.text();
  expect(sitemap).not.toContain("social-preview");
  expect(sitemap).not.toContain("social-cards");
});
