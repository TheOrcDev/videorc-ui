import { render, renderHook, screen } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it } from "vitest";

import { WINDOW_TITLE_CLASS } from "@/components/pane";
import {
  TRAFFIC_LIGHT_GUTTER_CLASS,
  WindowFrame,
  WindowHeader,
  useTrafficLightGutter,
} from "@/components/window-frame";

afterEach(() => {
  delete document.documentElement.dataset.platform;
});

describe("useTrafficLightGutter", () => {
  it("keeps the traffic-light gutter on macOS, whatever the window size", () => {
    // A fullscreen header still shares its row with the lights.
    expect(
      renderHook(() => useTrafficLightGutter("darwin")).result.current
    ).toBe(TRAFFIC_LIGHT_GUTTER_CLASS);
    expect(TRAFFIC_LIGHT_GUTTER_CLASS).toBe("pl-[88px]");
  });

  it("pads like any row off macOS, where the native frame owns the title bar", () => {
    for (const platform of ["win32", "linux"]) {
      expect(
        renderHook(() => useTrafficLightGutter(platform)).result.current
      ).toBe("pl-3");
    }
  });

  it("reads data-platform on the root when no platform is passed", () => {
    document.documentElement.dataset.platform = "darwin";
    expect(renderHook(() => useTrafficLightGutter()).result.current).toBe(
      TRAFFIC_LIGHT_GUTTER_CLASS
    );
  });

  it("renders without the gutter on a server, which can't know the platform", () => {
    const markup = renderToStaticMarkup(<WindowHeader title="Notes" />);
    expect(markup).toContain("pl-3");
    expect(markup).not.toContain(TRAFFIC_LIGHT_GUTTER_CLASS);
  });
});

describe("WindowFrame", () => {
  it("paints the content coat for a single-pane window", () => {
    const markup = renderToStaticMarkup(<WindowFrame>body</WindowFrame>);
    expect(markup).toContain('data-slot="window-frame"');
    expect(markup).toContain("bg-glass-content");
  });
});

describe("WindowHeader", () => {
  // One title row for Stream Manager, Notes and the Captions reader, in the
  // main window's recipe.
  it("titles the window with an h1 at 14 px / 600 on a 40 px drag band by the lights", () => {
    const { container } = render(
      <WindowHeader platform="darwin" title="Stream Manager" />
    );
    const header = container.querySelector("[data-slot=window-header]");
    const title = screen.getByRole("heading", {
      level: 1,
      name: "Stream Manager",
    });
    expect(title.className).toBe(`${WINDOW_TITLE_CLASS} shrink-0`);
    expect(title).toHaveAttribute("data-slot", "window-header-title");
    expect(header?.className).toContain("h-toolbar");
    expect(header?.className).toContain("[-webkit-app-region:drag]");
    expect(header?.className).toContain(TRAFFIC_LIGHT_GUTTER_CLASS);
    // The title alone: no controls slot unless a window passes controls.
    expect(
      container.querySelector("[data-slot=window-header-actions]")
    ).toBeNull();
    expect(container.querySelector("button")).toBeNull();
  });

  it("puts a quiet fact after the title and the controls at the end, out of the drag band", () => {
    const { container } = render(
      <WindowHeader meta={<span>Listening</span>} title="Notes">
        <button type="button">Pin</button>
      </WindowHeader>
    );
    expect(
      container.querySelector("[data-slot=window-header-meta]")?.innerHTML
    ).toBe("<span>Listening</span>");
    const actions = container.querySelector(
      "[data-slot=window-header-actions]"
    );
    expect(actions?.className).toContain("ml-auto");
    expect(actions?.className).toContain("[-webkit-app-region:no-drag]");
    expect(actions?.firstElementChild?.tagName).toBe("BUTTON");
  });
});
