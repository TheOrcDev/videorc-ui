import { readFileSync } from "node:fs";
import path from "node:path";

import { act, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { ChromeGround } from "@/components/chrome-ground";

// The chrome ground is decoration under every window, sized to the display,
// swapped by the theme class, and never filtered or animated.

const DARK = "/chrome-ground/dark.webp";
const LIGHT = "/chrome-ground/light.webp";

const setDisplay = (width: number, height: number): void => {
  Object.defineProperty(window, "screen", {
    configurable: true,
    value: { height, width },
  });
};

const setViewport = (width: number, height: number): void => {
  Object.defineProperty(window, "innerWidth", {
    configurable: true,
    value: width,
  });
  Object.defineProperty(window, "innerHeight", {
    configurable: true,
    value: height,
  });
};

const ground = (): HTMLElement => {
  const element = document.querySelector<HTMLElement>("[data-chrome-ground]");
  if (!element) {
    throw new Error("no chrome ground");
  }
  return element;
};

const image = (theme: "dark" | "light"): HTMLImageElement => {
  const element = document.querySelector<HTMLImageElement>(
    `img[data-chrome-ground-image="${theme}"]`
  );
  if (!element) {
    throw new Error(`no ${theme} ground image`);
  }
  return element;
};

const displaySize = (): string[] => [
  ground().style.getPropertyValue("--chrome-ground-width"),
  ground().style.getPropertyValue("--chrome-ground-height"),
];

const originalScreen = Object.getOwnPropertyDescriptor(window, "screen");

beforeEach(() => {
  setDisplay(1728, 1117);
  setViewport(1180, 780);
});

afterEach(() => {
  if (originalScreen) {
    Object.defineProperty(window, "screen", originalScreen);
  }
});

describe("ChromeGround", () => {
  it("paints both themes' stills under a coat, hidden from assistive tech and the pointer", () => {
    render(<ChromeGround dark={DARK} light={LIGHT} />);
    const element = ground();
    expect(element).toHaveAttribute("aria-hidden", "true");
    for (const utility of [
      "fixed",
      "inset-0",
      "-z-10",
      "pointer-events-none",
      "overflow-hidden",
    ]) {
      expect(element.classList.contains(utility), utility).toBe(true);
    }
    const light = image("light");
    const dark = image("dark");
    expect(light).toHaveAttribute("src", LIGHT);
    expect(dark).toHaveAttribute("src", DARK);
    for (const img of [light, dark]) {
      expect(img).toHaveAttribute("alt", "");
      expect(img).toHaveAttribute("decoding", "sync");
      expect(img).toHaveAttribute("draggable", "false");
      expect(img.classList.contains("object-cover")).toBe(true);
      expect(img.classList.contains("max-w-none")).toBe(true);
      expect(img.classList.contains("w-(--chrome-ground-width)")).toBe(true);
      expect(img.classList.contains("h-(--chrome-ground-height)")).toBe(true);
    }
    // The theme class picks the still, so a toggle swaps it with the coats.
    expect(light.classList.contains("dark:hidden")).toBe(true);
    expect(dark.classList.contains("hidden")).toBe(true);
    expect(dark.classList.contains("dark:block")).toBe(true);
    // The window coat frosts the still from inside the ground layer.
    const coat = element.querySelector("[data-chrome-ground-coat]");
    expect(coat?.classList.contains("bg-glass-window")).toBe(true);
    expect(coat?.classList.contains("inset-0")).toBe(true);
    // Last in the layer: over both images.
    expect(element.lastElementChild).toBe(coat);
  });

  it("sizes the still to the display and re-reads it on resize, never to the window", () => {
    render(<ChromeGround dark={DARK} light={LIGHT} />);
    expect(displaySize()).toEqual(["1728px", "1117px"]);
    // A resize alone changes nothing: the window's size is not the still's.
    setViewport(1400, 900);
    act(() => {
      window.dispatchEvent(new Event("resize"));
    });
    expect(displaySize()).toEqual(["1728px", "1117px"]);
    // A new display is read on the next resize.
    setDisplay(2560, 1440);
    act(() => {
      window.dispatchEvent(new Event("resize"));
    });
    expect(displaySize()).toEqual(["2560px", "1440px"]);
  });

  it("never lets the still be smaller than the viewport: a window can outgrow its screen", () => {
    setDisplay(1440, 900);
    setViewport(2000, 1200);
    render(<ChromeGround dark={DARK} light={LIGHT} />);
    expect(displaySize()).toEqual(["2000px", "1200px"]);
  });

  it("holds the ground inside a container when its layout says so", () => {
    render(<ChromeGround className="absolute" dark={DARK} light={LIGHT} />);
    expect(ground().classList.contains("absolute")).toBe(true);
    expect(ground().classList.contains("fixed")).toBe(false);
  });

  it("has no CSS filter, transition, animation or backdrop-filter", () => {
    const source = readFileSync(
      path.join(process.cwd(), "components/chrome-ground.tsx"),
      "utf-8"
    );
    const code = source
      .replaceAll(/\/\*[\s\S]*?\*\//gu, "")
      .replaceAll(/^\s*\/\/.*$/gmu, "");
    expect(code).not.toMatch(
      /\bfilter\b|\btransition|\banimat|\bbackdrop|\bblur/u
    );
  });

  it("hides under Reduce Transparency, from the theme", () => {
    const styles = readFileSync(
      path.join(process.cwd(), "styles/videorc.css"),
      "utf-8"
    );
    const reduced = styles.slice(
      styles.indexOf("@media (prefers-reduced-transparency: reduce)")
    );
    expect(reduced).toMatch(
      /\[data-chrome-ground\]\s*\{\s*display:\s*none;\s*\}/u
    );
  });
});
