import type { Root } from "fumadocs-core/page-tree";
import { describe, expect, it } from "vitest";

import { searchGroups } from "@/lib/search-groups";

const page = (name: string, url: string) =>
  ({ name, type: "page", url }) as const;

// Shaped like the docs sidebar: the components folder is spread into the top
// level, so its own sub-headings sit beside the section headings.
const tree: Root = {
  children: [
    { name: "Getting started", type: "separator" },
    page("Introduction", "/docs"),
    page("Installation", "/docs/installation"),
    { name: "Concepts", type: "separator" },
    page("Theming", "/docs/concepts/theming"),
    { name: "Components", type: "separator" },
    page("Components", "/docs/components"),
    { name: "Inputs", type: "separator" },
    page("Button", "/docs/components/button"),
    { name: "Fader", type: "separator" },
    page("Fader", "/docs/components/fader"),
    { name: "Primitives", type: "separator" },
    {
      children: [page("List row", "/docs/primitives/list-row")],
      index: page("Primitives", "/docs/primitives"),
      name: "Primitives",
      type: "folder",
    },
  ],
  name: "Docs",
};

describe("searchGroups", () => {
  it("groups pages by section, overview first, in menu order", () => {
    expect(searchGroups(tree)).toEqual([
      {
        items: [
          { title: "Introduction", url: "/docs" },
          { title: "Installation", url: "/docs/installation" },
        ],
        label: "Getting started",
      },
      {
        items: [{ title: "Theming", url: "/docs/concepts/theming" }],
        label: "Concepts",
      },
      {
        items: [
          { title: "All components", url: "/docs/components" },
          { title: "Button", url: "/docs/components/button" },
          { title: "Fader", url: "/docs/components/fader" },
        ],
        label: "Components",
      },
      {
        items: [
          { title: "All primitives", url: "/docs/primitives" },
          { title: "List row", url: "/docs/primitives/list-row" },
        ],
        label: "Primitives",
      },
    ]);
  });

  it("lists a page reached twice only once", () => {
    const twice: Root = {
      children: [
        page("Button", "/docs/components/button"),
        page("Button", "/docs/components/button"),
      ],
      name: "Docs",
    };
    expect(searchGroups(twice)).toEqual([
      {
        items: [{ title: "Button", url: "/docs/components/button" }],
        label: "Components",
      },
    ]);
  });
});
