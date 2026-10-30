import { act, fireEvent, render, screen } from "@testing-library/react";
import { ThemeProvider } from "next-themes";
import { afterEach, describe, expect, it } from "vitest";

import { ThemeToggle } from "@/components/theme-toggle";

afterEach(() => {
  document.documentElement.className = "";
  localStorage.clear();
});

const renderToggle = () =>
  render(
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <ThemeToggle />
    </ThemeProvider>
  );

describe("ThemeToggle", () => {
  it("keeps one name whatever the theme, and flips it on a click", () => {
    renderToggle();
    const button = screen.getByRole("button", { name: "Toggle color theme" });
    expect(button).toHaveAttribute("data-slot", "theme-toggle");
    expect(button).not.toHaveAttribute("title");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    act(() => {
      fireEvent.click(button);
    });
    expect(document.documentElement.classList.contains("light")).toBe(true);
    expect(
      screen.getByRole("button", { name: "Toggle color theme" })
    ).toBeInTheDocument();
  });

  it("flips with D, outside a field", () => {
    renderToggle();
    act(() => {
      fireEvent.keyDown(document.body, { key: "d" });
    });
    expect(document.documentElement.classList.contains("light")).toBe(true);
  });
});
