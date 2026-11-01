import { readFileSync } from "node:fs";
import path from "node:path";

import { parse } from "postcss";
import type { AtRule, Container, Declaration, Rule } from "postcss";
import { describe, expect, it } from "vitest";

// Record's material (Button's `record`, RecordButton): metallic red with no
// border or ring, whose glow alone breathes.

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
    node.params === "chrome-led"
);

const keyframes = root.nodes.find(
  (node): node is AtRule =>
    node.type === "atrule" &&
    node.name === "keyframes" &&
    node.params === "chrome-led-breathe"
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

const METAL_TOKENS = [
  "--chrome-led-off-stops",
  "--chrome-led-off-flat",
  "--chrome-led-stops",
  "--chrome-led-flat",
];

describe("chrome-led", () => {
  it("gives both themes the whole material: idle and lit metal, and the glow", () => {
    for (const [theme, vars] of Object.entries(THEMES)) {
      for (const token of [...METAL_TOKENS, "--chrome-led-glow"]) {
        expect(vars.get(token), `${theme} ${token}`).toBeDefined();
      }
      expect(vars.get("--chrome-led-glow")).toMatch(
        /^color-mix\(in oklch, var\(--live\) \d+%, transparent\)$/u
      );
    }
  });

  it("keeps the white label at 4.5:1 on every stop of the metal, idle and lit", () => {
    for (const [theme, vars] of Object.entries(THEMES)) {
      const [label] = colours(vars.get("--live-foreground") ?? "");
      expect(label, `${theme} --live-foreground`).toBeDefined();
      for (const token of METAL_TOKENS) {
        const stops = colours(vars.get(token) ?? "");
        expect(stops.length, `${theme} ${token}`).toBeGreaterThan(0);
        for (const stop of stops) {
          expect(
            contrast(label ?? 1, stop),
            `${theme} ${token}`
          ).toBeGreaterThanOrEqual(4.5);
        }
      }
    }
  });

  it("breathes the glow alone, on opacity alone", () => {
    expect(utility).toBeDefined();
    expect(keyframes).toBeDefined();
    keyframes?.walkDecls((decl) => {
      expect(decl.prop).toBe("opacity");
    });
    const moving: string[] = [];
    utility?.walkDecls(/^(?:animation|transition)/u, (decl) => {
      moving.push(`${selectorPath(decl)} { ${decl.prop}: ${decl.value} }`);
      expect(selectorPath(decl), decl.prop).toContain("::after");
    });
    expect(moving.join("\n")).toContain("chrome-led-breathe");
  });

  it("draws no border or ring around the face, and keeps Tailwind's ring stack", () => {
    const body = utility?.toString() ?? "";
    utility?.walkDecls(/^border/u, (decl) => {
      expect(decl.prop, selectorPath(decl)).toBe("border-radius");
    });
    expect(body).not.toContain("--chrome-chromatic");
    expect(body).not.toMatch(/backdrop-filter/u);
    expect(body).toContain("var(--tw-ring-shadow)");
  });
});
