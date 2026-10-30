import { describe, expect, it } from "vitest";

import {
  buildAiPrompt,
  buildCompactPrompt,
  buildPageMarkdown,
  markdownUrlFor,
} from "@/lib/docs/ai-prompt";
import type { RegistryItem } from "@/lib/docs/registry";
import { getRegistryItem, resolveInstall } from "@/lib/docs/registry";

const item = (name: string): RegistryItem => {
  const found = getRegistryItem(name);
  if (!found) {
    throw new Error(`No registry item named "${name}"`);
  }
  return found;
};

/** Shaped like a processed page: an inlined example, then the usual sections. */
const BODY = `\`\`\`tsx title="components/examples/button-demo.tsx"
import { RecordIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
\`\`\`

## Installation

\`\`\`bash
npx shadcn@latest add @videorc/button
\`\`\`

## Usage

Import it.

## Examples

### Variants

\`default\` is the primary action.

\`\`\`tsx title="components/examples/button-variants.tsx"
const ButtonVariants = () => <Button>Default</Button>;
\`\`\`

### As a link

\`\`\`tsx title="components/examples/button-link.tsx"
const ButtonLink = () => <Button render={<a href="/" />} />;
\`\`\`

## Accessibility

Label icon-only buttons.
`;

const prompt = buildAiPrompt({
  body: BODY,
  description: "Desktop-sized buttons on Base UI.",
  install: resolveInstall(item("button")),
  pathname: "/docs/components/button",
  title: "Button",
});

describe("buildAiPrompt", () => {
  it("opens with what to add and where it came from", () => {
    expect(prompt).toMatch(/^# Add Button from videorc\/ui to this project\n/u);
    expect(prompt).toContain(
      "> Source: https://ui.videorc.com/docs/components/button"
    );
    expect(prompt).toContain("Desktop-sized buttons on Base UI.");
  });

  it("gives the registry, the command and the fallback URL", () => {
    expect(prompt).toContain(
      '{ "registries": { "@videorc": "https://ui.videorc.com/r/{name}.json" } }'
    );
    expect(prompt).toContain("npx shadcn@latest add @videorc/button");
    expect(prompt).toContain("https://ui.videorc.com/r/button.json");
  });

  it("drops the page's own install step, which the prompt replaces", () => {
    expect(
      prompt.match(/npx shadcn@latest add @videorc\/button/gu)
    ).toHaveLength(1);
  });

  it("lists what the CLI installs with it", () => {
    expect(prompt).toContain("`@videorc/theme`");
    expect(prompt).toContain("`@videorc/utils`");
    expect(prompt).not.toContain("shadcn/ui components:");
    expect(prompt).toContain("`@base-ui/react`");
    expect(prompt).toContain("CSS variables added to the global stylesheet");
  });

  it("turns the examples into links to the page's anchors", () => {
    expect(prompt).not.toContain("## Examples");
    expect(prompt).toContain(
      "  - Variants: https://ui.videorc.com/docs/components/button#variants"
    );
    expect(prompt).toContain(
      "  - As a link: https://ui.videorc.com/docs/components/button#as-a-link"
    );
    expect(prompt).not.toContain("button-variants.tsx");
  });

  it("warns about an item only the examples import", () => {
    expect(prompt).toContain("The examples on this page also import");
    expect(prompt).toContain("`@videorc/icons`");
  });

  it("keeps the sections that follow the examples", () => {
    const resources = prompt.indexOf("## Resources");
    expect(prompt.indexOf("## Accessibility")).toBeLessThan(resources);
    expect(resources).toBeGreaterThan(prompt.indexOf("## After installing"));
  });

  it("names a hook a hook and writes its one file", () => {
    const hook = buildAiPrompt({
      body: "## Usage\n\nCall it.\n",
      install: resolveInstall(item("use-reduced-motion")),
      pathname: "/docs/hooks/use-reduced-motion",
      title: "useReducedMotion",
    });
    expect(hook).toContain("This writes `hooks/use-reduced-motion.ts`.");
    expect(hook).toContain("- Import it from `@/hooks/use-reduced-motion`.");
    expect(hook).toContain(
      "- This page in the browser: https://ui.videorc.com/docs/hooks/use-reduced-motion"
    );
    expect(hook).not.toContain("live preview");
  });

  it("leaves no MDX components behind and ends with one newline", () => {
    expect(prompt).not.toMatch(/<(?:ComponentPreview|PropsTable|Callout)\b/u);
    expect(prompt).toMatch(/[^\n]\n$/u);
  });
});

describe("buildPageMarkdown", () => {
  it("serves a page with no registry item as its own body", () => {
    const markdown = buildPageMarkdown({
      body: "## Coats\n\nSome text.\n",
      description: "How Videorc's surfaces stack.",
      pathname: "/docs/concepts/design-language",
      title: "Design language",
    });
    expect(markdown).toMatch(/^# Design language\n/u);
    expect(markdown).toContain("How Videorc's surfaces stack.");
    expect(markdown).toContain("## Coats");
    expect(markdown).not.toContain("## Install");
  });
});

describe("buildCompactPrompt", () => {
  it("points at the Markdown page instead of carrying it", () => {
    const compact = buildCompactPrompt({
      name: "button",
      pathname: "/docs/components/button",
      title: "Button",
    });
    expect(compact).toContain("Add the videorc/ui Button to my project.");
    expect(compact).toContain(
      "https://ui.videorc.com/docs/components/button.md"
    );
    expect(compact).toContain("https://ui.videorc.com/r/button.json");
    // Chat URLs cap out around 6 KB.
    expect(compact.length).toBeLessThan(500);
  });
});

describe("markdownUrlFor", () => {
  it("appends .md to a docs pathname", () => {
    expect(markdownUrlFor("/docs/components/button")).toBe(
      "/docs/components/button.md"
    );
  });
});
