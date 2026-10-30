import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const DOCS = path.join(process.cwd(), "content/docs");
const SEPARATOR = /^---.*---$/u;
const FOLDER_SPREAD = /^\.\.\./u;

const metaFiles = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      return metaFiles(full);
    }
    return entry.name === "meta.json" ? [full] : [];
  });

const listedPages = (file: string): string[] => {
  const { pages } = JSON.parse(readFileSync(file, "utf-8")) as {
    pages: string[];
  };
  return pages.filter((page) => !SEPARATOR.test(page));
};

describe("docs sidebar", () => {
  for (const file of metaFiles(DOCS)) {
    const folder = path.relative(DOCS, path.dirname(file)) || "docs";

    it(`${folder} lists each page once`, () => {
      const pages = listedPages(file);
      expect(
        pages.filter((page, index) => pages.indexOf(page) !== index)
      ).toEqual([]);
    });

    it(`${folder} lists only pages that exist, and all of them`, () => {
      const dir = path.dirname(file);
      const pages = listedPages(file);
      for (const page of pages) {
        const name = page.replace(FOLDER_SPREAD, "");
        expect(
          existsSync(path.join(dir, `${name}.mdx`)) ||
            existsSync(path.join(dir, name))
        ).toBe(true);
      }
      const mdx = readdirSync(dir)
        .filter((entry) => entry.endsWith(".mdx"))
        .map((entry) => entry.replace(/\.mdx$/u, ""));
      expect(mdx.filter((name) => !pages.includes(name))).toEqual([]);
    });
  }
});
