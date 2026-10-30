import { expect, test } from "@playwright/test";

import { siteConfig } from "../lib/site";
import { docsPages } from "./routes";

const pages = docsPages;

test("the public sitemap includes every concrete page and robots permits indexing", async ({
  request,
}) => {
  const response = await request.get("/sitemap.xml");
  expect(response.status()).toBe(200);
  const xml = await response.text();
  const urls = (xml.match(/<loc>[^<]+<\/loc>/gu) ?? []).map((tag) =>
    tag.replace("<loc>", "").replace("</loc>", "")
  );
  const expected = [
    siteConfig.url,
    ...pages.map((page) => new URL(page, siteConfig.url).href),
  ];
  expect(urls.toSorted()).toEqual(expected.toSorted());
  const robots = await request.get("/robots.txt");
  expect(robots.status()).toBe(200);
  expect(await robots.text()).toContain(
    `Sitemap: ${siteConfig.url}/sitemap.xml`
  );
  expect(await robots.text()).toContain("Allow: /");
});

test("missing docs pages offer a way back to the documentation", async ({
  page,
}) => {
  const response = await page.goto("/docs/does-not-exist");
  expect(response?.status()).toBe(404);
  await expect(
    page.getByRole("heading", { name: "Page not found" })
  ).toBeVisible();
  await page.getByRole("link", { name: "Browse documentation" }).click();
  await expect(
    page.getByRole("heading", { exact: true, name: "Introduction" })
  ).toBeVisible();
});

test.describe("every docs page", () => {
  for (const url of pages) {
    test(`renders ${url} and switches its previews to code and back`, async ({
      page,
    }) => {
      const errors: string[] = [];
      page.on("pageerror", (error) => errors.push(error.message));
      page.on("console", (message) => {
        // Vercel serves its analytics script only on its own deployments.
        const vercelScript = message.location().url.includes("/_vercel/");
        if (message.type() === "error" && !vercelScript) {
          errors.push(message.text());
        }
      });
      const response = await page.goto(url);
      expect(response?.status()).toBe(200);
      await expect(page.locator("h1").first()).toBeVisible();
      await page.waitForTimeout(500);
      // Showing the code unmounts the preview, so its cleanup runs.
      const codeTabs = page.getByRole("tab", { exact: true, name: "Code" });
      const previewTabs = page.getByRole("tab", {
        exact: true,
        name: "Preview",
      });
      const count = await codeTabs.count();
      // One preview at a time, in order.
      const toggleFrom = async (index: number): Promise<void> => {
        if (index >= count) {
          return;
        }
        await codeTabs.nth(index).click();
        await previewTabs.nth(index).click();
        await toggleFrom(index + 1);
      };
      await toggleFrom(0);
      await page.waitForTimeout(500);
      await expect(page.locator("h1").first()).toBeVisible();
      expect(errors).toEqual([]);
    });
  }
});

test("the search dialog lists docs and links before anything is typed", async ({
  page,
}) => {
  await page.goto("/docs");
  const trigger = page.getByRole("button", { name: "Search" }).first();
  await trigger.click();
  const dialog = page.getByRole("dialog");
  await Promise.all(
    ["Getting started", "Concepts", "Components", "Links"].map((heading) =>
      expect(dialog.getByText(heading, { exact: true })).toBeVisible()
    )
  );
  await dialog.getByRole("option", { exact: true, name: "Button" }).click();
  await expect(page).toHaveURL(/\/docs\/components\/button$/u);
});

test("the registry serves built items", async ({ request }) => {
  const response = await request.get("/r/button.json");
  expect(response.ok()).toBe(true);
  const item = (await response.json()) as {
    name: string;
    files: { content: string }[];
    registryDependencies: string[];
  };
  expect(item.name).toBe("button");
  expect(item.files[0]?.content).toContain("buttonVariants");
  expect(item.registryDependencies).toContain("@videorc/theme");

  const theme = await request.get("/r/theme.json");
  expect(theme.ok()).toBe(true);
});

test("llms.txt lists the docs", async ({ request }) => {
  const response = await request.get("/llms.txt");
  expect(await response.text()).toContain("Button");
});
