import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import {
  classify,
  evaluate,
  float,
  parseColour,
  renderTokens,
  resolveTokens,
  toHex,
} from "./gpui-tokens.mjs";

const THEME = "styles/videorc.css";
const resolved = resolveTokens(readFileSync(THEME, "utf-8"), THEME);

const hex = (value: string): string => {
  const colour = parseColour(value);
  if (!colour) {
    throw new Error(`${value} is not a colour`);
  }
  return toHex(colour);
};

const token = (constName: string, prop: string) => {
  const appearance = resolved.appearances.find(
    (entry) => entry.constName === constName
  );
  const found = appearance?.tokens.find((entry) => entry.prop === prop);
  if (!found) {
    throw new Error(`${constName} has no ${prop}`);
  }
  return found;
};

const ALPHA_MASK = 0xff;
const CHANNEL_MAX = 255;
const alpha = (constName: string, prop: string): number => {
  const found = token(constName, prop);
  if (found.kind !== "colour" || !found.colour) {
    throw new Error(`${prop} is not a colour`);
  }
  // oxlint-disable-next-line no-bitwise -- the alpha byte of 0xRRGGBBAA
  return (Number(toHex(found.colour)) & ALPHA_MASK) / CHANNEL_MAX;
};

describe("gpui tokens", () => {
  it("resolves oklch, hex and transparent to sRGB as Chromium draws them", () => {
    expect(hex("oklch(0.13 0 0)")).toBe("0x070707ff");
    expect(hex("oklch(0.985 0 0)")).toBe("0xfafafaff");
    expect(hex("oklch(1 0 0 / 35%)")).toBe("0xffffff59");
    expect(hex("#ff0033")).toBe("0xff0033ff");
    expect(hex("transparent")).toBe("0x00000000");
  });

  it("mixes premultiplied in srgb, oklab and oklch", () => {
    // Dark's dialog: the solid plus 6% white, mixed in sRGB (about #161616).
    expect(hex("color-mix(in srgb, oklch(1 0 0) 6%, oklch(0.13 0 0))")).toBe(
      "0x161616ff"
    );
    // A mix with transparent keeps the colour and scales its alpha.
    expect(hex("color-mix(in oklch, oklch(0.6 0 0) 45%, transparent)")).toBe(
      hex("oklch(0.6 0 0 / 45%)")
    );
    expect(hex("color-mix(in oklab, oklch(0.6 0 0) 3%, transparent)")).toBe(
      hex("oklch(0.6 0 0 / 3%)")
    );
  });

  it("evaluates calc, min and max with rem as 16 px", () => {
    expect(evaluate("calc(0.625rem - 4px)")).toEqual({ n: 6, unit: "px" });
    expect(evaluate("min(0.88, 0.82)").n).toBeCloseTo(0.82);
    expect(
      evaluate("calc(1 - (1 - 0.88) / max(1 - 0.82, 0.001))").n
    ).toBeCloseTo(1 / 3);
  });

  it("places missing stop positions and reads conic stops in turns", () => {
    const bead = classify("oklch(1 0 0), oklch(0.9 0 0) 55%, oklch(0.7 0 0)");
    expect(bead.kind).toBe("stops");
    expect(bead.stops?.map((stop: { at?: number }) => stop.at)).toEqual([
      0, 0.55, 1,
    ]);
    const bands = classify("oklch(0.3 0 0) 0deg, oklch(0.3 0 0) 120deg");
    expect(bands.stops?.at(-1)?.at).toBeCloseTo(1 / 3);
  });

  it("reads shadows, inset and drop", () => {
    const shadows = classify(
      "inset 0 1px 0 oklch(1 0 0 / 35%), 0 1px 3px oklch(0 0 0 / 35%)"
    );
    expect(shadows.kind).toBe("shadows");
    expect(
      shadows.shadows?.map(({ inset, y, blur }) => [inset, y, blur])
    ).toEqual([
      [true, 1, 0],
      [false, 1, 3],
    ]);
  });

  it("lands on each theme's solid", () => {
    expect(hex("oklch(0.13 0 0)")).toBe(
      toHex(token("DARK", "--glass-solid").colour)
    );
    expect(toHex(token("LIGHT", "--glass-solid").colour)).toBe("0xfafafaff");
  });

  it("derives the coats so the sidebar composites to its cover", () => {
    for (const appearance of resolved.appearances) {
      const { constName } = appearance;
      const body = alpha(constName, "--glass-window");
      const sidebar = alpha(constName, "--glass-sidebar");
      const cover = token(constName, "--glass-cover-sidebar").number ?? 0;
      // Each alpha is one byte, so allow two steps of rounding.
      expect(1 - (1 - body) * (1 - sidebar)).toBeCloseTo(cover, 2);
    }
  });

  it("strengthens hairlines and text tiers under Increase Contrast", () => {
    expect(alpha("DARK_INCREASE_CONTRAST", "--border")).toBeGreaterThan(
      alpha("DARK", "--border")
    );
    expect(alpha("LIGHT_INCREASE_CONTRAST", "--border")).toBeGreaterThan(
      alpha("LIGHT", "--border")
    );
    expect(
      toHex(token("DARK_INCREASE_CONTRAST", "--muted-foreground").colour)
    ).not.toBe(toHex(token("DARK", "--muted-foreground").colour));
  });

  it("writes f32 literals rustc accepts", () => {
    expect(float(12)).toBe("12.0");
    expect(float(1 / 3)).toBe("0.3333");
    expect(float(-0)).toBe("0.0");
  });

  it("is what gpui/kit/src/tokens.rs holds (pnpm theme:build)", () => {
    expect(readFileSync("gpui/kit/src/tokens.rs", "utf-8")).toBe(
      renderTokens(resolved)
    );
  });
});
