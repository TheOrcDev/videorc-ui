import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import {
  captionFor,
  getSocialCards,
  previewDescriptions,
  previewOptions,
  socialCompositions,
} from "@/lib/social-catalog";
import socialImages from "@/lib/social-images.json";
import type { SocialImage } from "@/lib/social-metadata";

import { docsPages, publicPages } from "../e2e/routes";

const TITLE = "title: ";

// The catalog reads titles from Fumadocs; here they come from the frontmatter.
const pageFile = (url: string): string => {
  const slug = url.replace(/^\/docs\/?/u, "");
  const flat = path.join(process.cwd(), "content/docs", `${slug}.mdx`);
  return slug && existsSync(flat)
    ? flat
    : path.join(process.cwd(), "content/docs", slug, "index.mdx");
};

const socialCards = getSocialCards(
  docsPages.map((url) => ({
    data: {
      title:
        readFileSync(pageFile(url), "utf-8")
          .split("\n")
          .find((line) => line.startsWith(TITLE))
          ?.slice(TITLE.length) ?? "",
    },
    url,
  }))
);
const images: Record<string, SocialImage | undefined> = socialImages;
const compositions: readonly string[] = socialCompositions;

const isPreview = (name: string): boolean =>
  compositions.includes(name) ||
  existsSync(path.join(process.cwd(), "components/examples", `${name}.tsx`));

describe("social cards", () => {
  it("cover every public page, once", () => {
    expect(socialCards.map((card) => card.pathname).toSorted()).toEqual(
      publicPages.toSorted()
    );
    expect(new Set(socialCards.map((card) => card.id)).size).toBe(
      socialCards.length
    );
  });

  it("preview a real demo or composition, and say what it shows", () => {
    for (const card of socialCards) {
      expect(isPreview(card.preview), card.preview).toBe(true);
      expect(previewDescriptions[card.preview], card.preview).toBeDefined();
    }
  });

  it("tune only previews that exist", () => {
    for (const name of Object.keys(previewOptions)) {
      expect(isPreview(name), name).toBe(true);
    }
  });

  it("caption a long description with its first sentence", () => {
    expect(captionFor("Short and sweet.")).toBe("Short and sweet.");
    const long = `First sentence, with a comma. ${"Then a long tail of words. ".repeat(8)}`;
    expect(captionFor(long)).toBe("First sentence, with a comma.");
  });
});

describe("social images", () => {
  it("are exactly the cards: no page without one, no image without a page", () => {
    expect(Object.keys(images).toSorted()).toEqual(publicPages.toSorted());
  });

  for (const card of socialCards) {
    it(`ship a valid, versioned image for ${card.pathname}`, () => {
      const image = images[card.pathname];
      expect(image).toBeDefined();
      if (!image) {
        return;
      }
      // Regenerate with `pnpm og:build --only <id>` when the alt text changes.
      expect(image.alt).toBe(card.alt);
      const bytes = readFileSync(
        path.join(process.cwd(), "public", image.url.slice(1))
      );
      expect(bytes.subarray(0, 8).toString("hex")).toBe("89504e470d0a1a0a");
      expect([bytes.readUInt32BE(16), bytes.readUInt32BE(20)]).toEqual([
        1200, 630,
      ]);
      expect(bytes.length).toBeLessThanOrEqual(1_500_000);
      const hash = createHash("sha256")
        .update(bytes)
        .digest("hex")
        .slice(0, 12);
      expect(image.url).toBe(`/og/${card.id}-${hash}.png`);
    });
  }
});
