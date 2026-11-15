import { readFileSync } from "node:fs";
import path from "node:path";

import { parse } from "postcss";
import type { AtRule, Container, Declaration, Rule } from "postcss";
import { describe, expect, it } from "vitest";

// Go Live's material (Button's `go-live`, GoLiveButton): polished copper
// with no border or ring, and still.

const root = parse(
  readFileSync(path.join(import.meta.dirname, "videorc.css"), "utf-8")
);

const themeVars = (selector: string): Map<string, string> => {
  const vars = new Map<string, string>();
  for (const node of root.nodes) {
    if (node.type === "rule" && node.selector === selector) {
      node.walkDecls((decl) => {
        vars.set(decl.prop, decl.value);
      });
    }
  }
  return vars;
};

const THEMES = { dark: themeVars(".dark"), light: themeVars(":root") };

const utility = root.nodes.find(
  (node): node is AtRule =>
    node.type === "atrule" &&
    node.name === "utility" &&
    node.params === "chrome-copper"
);

/** Every selector from the utility down to a declaration, joined. */
const selectorPath = (decl: Declaration): string => {
  const selectors: string[] = [];
  let parent: Container | undefined = decl.parent;
  while (parent && parent !== utility) {
    if (parent.type === "rule") {
      selectors.unshift((parent as Rule).selector);
    }
    parent = parent.parent as Container | undefined;
  }
  return selectors.join(" ");
};

// OKLCH to relative luminance (CSS Color 4), for the label's contrast.
const OKLCH = /oklch\([^)]*\)/gu;
const WHITESPACE = /\s+/u;

const luminance = (lightness: number, chroma: number, hue: number): number => {
  const radians = (hue * Math.PI) / 180;
  const a = chroma * Math.cos(radians);
  const b = chroma * Math.sin(radians);
  const l = (lightness + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (lightness - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (lightness - 0.0894841775 * a - 1.291485548 * b) ** 3;
  const [red, green, blue] = [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ].map((channel) => Math.min(1, Math.max(0, channel)));
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
};

const colours = (value: string): number[] =>
  [...value.matchAll(OKLCH)].map(([colour]) => {
    const [lightness, chroma, hue] = colour
      .slice("oklch(".length, -1)
      .trim()
      .split(WHITESPACE)
      .map(Number);
    return luminance(lightness ?? 0, chroma ?? 0, hue ?? 0);
  });

const contrast = (first: number, second: number): number =>
  (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05);

const METAL_TOKENS = ["--chrome-copper-stops", "--chrome-copper-flat"];

const SHADE_TOKENS = [
  "--chrome-copper-ink",
  "--chrome-copper-hi",
  "--chrome-copper-lo",
  "--chrome-copper-drop",
  "--chrome-copper-lift",
];

describe("chrome-copper", () => {
  it("gives both themes the whole material", () => {
    for (const [theme, vars] of Object.entries(THEMES)) {
      for (const token of [...METAL_TOKENS, ...SHADE_TOKENS]) {
        expect(vars.get(token), `${theme} ${token}`).toBeDefined();
      }
    }
  });

  it("keeps the ink at 4.5:1 on every stop of the metal", () => {
    for (const [theme, vars] of Object.entries(THEMES)) {
      const [ink] = colours(vars.get("--chrome-copper-ink") ?? "");
      expect(ink, `${theme} --chrome-copper-ink`).toBeDefined();
      for (const token of METAL_TOKENS) {
        const stops = colours(vars.get(token) ?? "");
        expect(stops.length, `${theme} ${token}`).toBeGreaterThan(0);
        for (const stop of stops) {
          expect(
            contrast(ink ?? 0, stop),
            `${theme} ${token}`
          ).toBeGreaterThanOrEqual(4.5);
        }
      }
    }
  });

  it("stays still: no animation and no transition", () => {
    expect(utility).toBeDefined();
    utility?.walkDecls(/^(?:animation|transition)/u, (decl) => {
      expect.fail(`${selectorPath(decl)} { ${decl.prop}: ${decl.value} }`);
    });
  });

  it("draws no border or ring around the face, and keeps Tailwind's ring stack", () => {
    const body = utility?.toString() ?? "";
    utility?.walkDecls(/^border/u, (decl) => {
      expect(decl.prop, selectorPath(decl)).toBe("border-radius");
    });
    expect(body).not.toMatch(/backdrop-filter/u);
    expect(body).not.toContain("::after");
    expect(body).toContain("var(--tw-ring-shadow)");
    expect(body).toContain("var(--chrome-edge)");
  });
});
