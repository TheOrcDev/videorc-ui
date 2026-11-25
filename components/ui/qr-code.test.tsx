import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { QrCode, qrCodePath } from "./qr-code";

describe("qrCodePath", () => {
  it("encodes with a quiet zone and dark modules", () => {
    const { path, size } = qrCodePath("https://example.com/pair");
    expect(size).toBeGreaterThan(4);
    expect(path).toMatch(/^M/u);
    expect(path.includes("h")).toBe(true);
  });
});

describe("QrCode", () => {
  it("renders a labelled SVG", () => {
    render(<QrCode value="https://example.com/pair" />);
    const svg = screen.getByRole("img", { name: "QR code" });
    expect(svg.tagName.toLowerCase()).toBe("svg");
    expect(svg.querySelector("path")).toBeTruthy();
  });
});
