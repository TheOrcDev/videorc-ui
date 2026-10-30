import { readdirSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import type { RegistryItem } from "@/lib/docs/registry";
import {
  getRegistryItem,
  importPathFor,
  itemForImportPath,
  registryItemForPath,
  registryItemPath,
  registryItemUrl,
  resolveInstall,
} from "@/lib/docs/registry";
import registry from "@/registry.json";

const item = (name: string): RegistryItem => {
  const found = getRegistryItem(name);
  if (!found) {
    throw new Error(`No registry item named "${name}"`);
  }
  return found;
};

const SECTIONS = ["components", "primitives", "hooks"] as const;

const pageSlugs = (section: string) => {
  const dir = path.join(process.cwd(), "content/docs", section);
  try {
    return readdirSync(dir)
      .filter((file) => file.endsWith(".mdx") && file !== "index.mdx")
      .map((file) => file.replace(/\.mdx$/u, ""));
  } catch {
    return [];
  }
};

describe("resolveInstall", () => {
  it("walks registry dependencies transitively", () => {
    const plan = resolveInstall(item("use-theme-toggle"));
    expect(plan.registryItems.map((entry) => entry.name)).toEqual([
      "modal-open",
    ]);
    expect(plan.npmDependencies).toEqual(["next-themes"]);
  });

  it("installs Videorc's own cn, never the stock shadcn utils", () => {
    const plan = resolveInstall(item("button"));
    expect(plan.registryItems.map((entry) => entry.name)).toEqual(
      expect.arrayContaining(["theme", "utils"])
    );
    expect(plan.shadcnItems).toEqual([]);
    expect(plan.npmDependencies).toEqual(
      expect.arrayContaining(["@base-ui/react", "class-variance-authority"])
    );
  });

  it("reports the theme tokens when the theme comes with it", () => {
    expect(resolveInstall(item("button")).cssVariables).toContain(
      "--glass-float"
    );
    expect(resolveInstall(item("accelerator")).cssVariables).toEqual([]);
  });

  it("keeps a standalone item's plan empty", () => {
    const plan = resolveInstall(item("use-reduced-motion"));
    expect(plan.registryItems).toEqual([]);
    expect(plan.npmDependencies).toEqual([]);
    expect(plan.shadcnItems).toEqual([]);
  });
});

describe("importPathFor", () => {
  it("maps each kind of item to the alias consumers import", () => {
    expect(importPathFor(item("button"))).toBe("@/components/ui/button");
    expect(importPathFor(item("use-reduced-motion"))).toBe(
      "@/hooks/use-reduced-motion"
    );
    expect(importPathFor(item("icons"))).toBe("@/components/icons");
  });
});

describe("registryItemPath", () => {
  it("is the canonical URL's path, same origin as the reader", () => {
    expect(registryItemPath("button")).toBe("/r/button.json");
    expect(new URL(registryItemUrl("button")).pathname).toBe(
      registryItemPath("button")
    );
  });
});

describe("itemForImportPath", () => {
  it("finds the item an example imports", () => {
    expect(itemForImportPath("@/components/icons")?.name).toBe("icons");
    expect(itemForImportPath("@/components/ui/not-an-item")).toBeUndefined();
  });
});

describe("registryItemForPath", () => {
  it("matches only the sections whose pages document an item", () => {
    expect(registryItemForPath("/docs/components/button")?.name).toBe("button");
    expect(registryItemForPath("/docs/concepts/theme")?.name).toBe("theme");
    expect(
      registryItemForPath("/docs/concepts/design-language")
    ).toBeUndefined();
    expect(registryItemForPath("/docs/installation")).toBeUndefined();
    expect(registryItemForPath("/docs/components")).toBeUndefined();
  });

  // The whole feature rests on the last path segment being the item name.
  it("has an item for every component, primitive and hook page", () => {
    for (const section of SECTIONS) {
      for (const slug of pageSlugs(section)) {
        const found = registryItemForPath(`/docs/${section}/${slug}`);
        expect(found?.name, `/docs/${section}/${slug}`).toBe(slug);
      }
    }
  });
});

describe("registry.json", () => {
  const items = registry.items as unknown as RegistryItem[];

  it("depends on its own items through the @videorc namespace", () => {
    const names = new Set(items.map((entry) => entry.name));
    for (const entry of items) {
      for (const dependency of entry.registryDependencies ?? []) {
        if (dependency.startsWith("@videorc/")) {
          expect(names, `${entry.name} → ${dependency}`).toContain(
            dependency.slice("@videorc/".length)
          );
        } else if (!dependency.startsWith("@")) {
          // A bare name is a stock shadcn item; ours would shadow it silently.
          expect(names, `${entry.name} → ${dependency}`).not.toContain(
            dependency
          );
        }
      }
    }
  });

  it("puts the theme under every component", () => {
    for (const entry of items) {
      if (entry.type === "registry:ui" || entry.type === "registry:block") {
        const plan = resolveInstall(entry);
        expect(
          plan.registryItems.map((dependency) => dependency.name),
          entry.name
        ).toContain("theme");
      }
    }
  });
});

describe("registry files", () => {
  // The shadcn CLI resolves an installed file's imports by file name, so two
  // files sharing a name (lib/foo.ts beside components/foo.tsx) get their
  // imports crossed: `@/lib/foo` is rewritten to `@/components/foo`.
  it("never share a file name", () => {
    const seen = new Map<string, string>();
    for (const entry of registry.items as unknown as RegistryItem[]) {
      for (const file of entry.files ?? []) {
        const name = file.path.replace(/^.*\//u, "").replace(/\.[^.]+$/u, "");
        expect(seen.get(name), `${file.path} and ${seen.get(name)}`).toBe(
          undefined
        );
        seen.set(name, file.path);
      }
    }
  });
});

describe("registry file headers", () => {
  // The shadcn CLI drops every comment before a file's first statement, so a
  // header written there never reaches an installed copy (and ui:check in
  // Videorc would see drift). Headers go below the first statement.
  it("keep no comment before the first statement", async () => {
    const ts = await import("typescript");
    const { readFileSync } = await import("node:fs");
    for (const entry of registry.items as unknown as RegistryItem[]) {
      for (const file of entry.files ?? []) {
        if (!/\.[jt]sx?$/u.test(file.path)) {
          continue;
        }
        const text = readFileSync(file.path, "utf-8");
        const source = ts.createSourceFile(
          file.path,
          text,
          ts.ScriptTarget.Latest,
          true
        );
        const [first] = source.statements;
        const leading = first
          ? (ts.getLeadingCommentRanges(text, first.getFullStart()) ?? [])
          : [];
        expect(leading, file.path).toEqual([]);
      }
    }
  });
});
