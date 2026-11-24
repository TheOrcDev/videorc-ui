import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import {
  completeIndex,
  crateModules,
  galleryPages,
  indexProblems,
  json,
  parseWorkspaceCargo,
  reactVariantGroups,
  rustEnums,
  shotProblems,
  shotSources,
  twinProblems,
} from "./gpui-registry.mjs";

const read = (file: string) => readFileSync(file, "utf-8");
const cargo = parseWorkspaceCargo(read("gpui/Cargo.toml"));
const index = JSON.parse(read("registry-gpui.json"));

describe("crateModules", () => {
  it("reads grouped, nested and inline crate paths, never a comment", () => {
    const source = `
      //! Uses [crate::ignored] only in a doc.
      use crate::{
          chrome::{self, Direction},
          theme::hsla,
          tokens,
      };
      use crate::kbd::Kbd;
      fn f() { crate::icon::icon(); } // crate::comment
    `;
    expect(crateModules(source)).toEqual([
      "chrome",
      "icon",
      "kbd",
      "theme",
      "tokens",
    ]);
  });
});

describe("parseWorkspaceCargo", () => {
  it("reads the kit's exact pins and its patches", () => {
    expect(cargo.dependencies.gpui).toEqual({
      package: "gpui-pre",
      version: "=0.3.14",
    });
    expect(cargo.dependencies.gpui_base).toEqual({
      package: "gpui-base",
      version: "=0.11.0",
    });
    expect(cargo.dependencies["videorc-kit"]).toBeUndefined();
    expect(cargo.patches).toEqual(["gpui-pre-apple"]);
  });
});

describe("registry-gpui.json", () => {
  it("is complete: running the build changes nothing", () => {
    const completed = completeIndex(index, { cargo, read });
    expect(completed.problems).toEqual([]);
    expect(json(completed.index)).toBe(read("registry-gpui.json"));
  });

  it("ships every kit module but lib.rs", () => {
    const modules = index.items.flatMap((item: { files: { path: string }[] }) =>
      item.files
        .map((file) => /src\/(\w+)\.rs$/u.exec(file.path)?.[1])
        .filter(Boolean)
    );
    expect(indexProblems(index, [...modules, "lib"])).toEqual([]);
    expect(indexProblems(index, [...modules, "list_row"])).toEqual([
      "gpui/kit/src/list_row.rs is in no item: add it to an item in registry-gpui.json.",
    ]);
  });

  it("derives dependencies from crate paths", () => {
    const button = index.items.find(
      (item: { name: string }) => item.name === "button"
    );
    expect(button.registryDependencies).toContain("@videorc-gpui/theme");
    expect(button.meta.crates.gpui.version).toBe("=0.3.14");
  });
});

describe("the twin check", () => {
  const button = {
    name: "button",
    reactItem: { name: "button" },
    reactSources: [read("components/ui/button.tsx")],
    rustSources: [read("gpui/kit/src/button.rs")],
  };

  it("passes when the variants and sizes match", () => {
    expect(rustEnums(button.rustSources[0]).get("ButtonSize")).toContain(
      "icon-xs"
    );
    expect(reactVariantGroups(button.reactSources[0]).variant).toContain(
      "go-live"
    );
    expect(twinProblems(button)).toEqual([]);
  });

  it("reads a group given as a constant (Dialog's sizes)", () => {
    expect(
      reactVariantGroups(read("components/ui/dialog.tsx")).size?.sort()
    ).toEqual(["lg", "md", "sm", "xl"]);
  });

  it("fails on a variant only one flavour has", () => {
    const planted = button.rustSources[0].replace("    Lg,\n", "");
    expect(twinProblems({ ...button, rustSources: [planted] })).toEqual([
      "button: ButtonSize differs from React's sizes; GPUI lacks lg.",
    ]);
  });

  it("fails on an item with no React twin", () => {
    expect(
      twinProblems({ ...button, name: "list-tile", reactItem: undefined })
    ).toEqual([
      '@videorc-gpui/list-tile has no React twin: registry.json has no item "list-tile".',
    ]);
  });
});

describe("the shots", () => {
  const pages = galleryPages(read("gpui/gallery/src/main.rs"));

  it("maps each gallery page to its item", () => {
    expect(pages.sonner).toEqual({
      file: "gpui/gallery/src/overlays.rs",
      fn: "toast_page",
    });
  });

  it("depend on the item, its dependencies and its page", () => {
    const sources = shotSources(index, "switch", pages);
    expect(sources).toContain("gpui/kit/src/switch.rs");
    expect(sources).toContain("gpui/kit/src/tokens.rs");
    expect(sources).toContain("gpui/gallery/src/controls.rs");
  });

  it("fail when stale, and when missing only in strict mode", () => {
    const base = {
      current: (name: string) => `${name}-now`,
      items: ["button", "switch"],
      present: (name: string) => name === "button",
      recorded: { button: "button-then" },
    };
    expect(shotProblems({ ...base, strict: false }).problems).toHaveLength(1);
    expect(shotProblems({ ...base, strict: true }).problems).toHaveLength(2);
    expect(
      shotProblems({
        ...base,
        recorded: { button: "button-now" },
        strict: false,
      })
    ).toEqual({ missing: ["switch"], problems: [] });
  });
});
