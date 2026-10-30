import { fireEvent, render, screen } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { GroupedList, ListRow, ListRowButton } from "@/components/list-row";
import { ConfigGrid, Gallery, PageHeader } from "@/components/page";
import {
  PANE_OWNS_SCROLL,
  Pane,
  PaneBody,
  PaneStrip,
  Toolbar,
  WINDOW_TITLE_CLASS,
} from "@/components/pane";
import { PanelSection } from "@/components/panel-section";
import { SECTION_LABEL, SectionLabel } from "@/components/section-label";
import {
  STATUS_BAR_ACTION_CLASS,
  StatusBar,
  StatusBarHint,
} from "@/components/status-bar";
import { StatusBarAction } from "@/components/status-bar-action";

// Panes, toolbars, flush sections, grouped lists and the status bar.

const tracks = (markup: string): string | undefined =>
  markup.match(/\[grid-template-columns:[^\s"]+\]/u)?.[0];

describe("Toolbar", () => {
  it("carries only the page title: no buttons in its top-right corner", () => {
    // Actions live with the content they act on.
    const { container } = render(
      <Pane>
        <Toolbar title="Library" />
        <PaneBody>
          <button type="button">Import</button>
        </PaneBody>
      </Pane>
    );
    const toolbar = container.querySelector("[data-slot=toolbar]");
    expect(toolbar?.querySelector("h1")?.textContent).toBe("Library");
    expect(toolbar?.querySelector("button")).toBeNull();
    expect(
      container.querySelector("[data-slot=pane-body] button")?.textContent
    ).toBe("Import");
  });

  it("makes the toolbar a 40 px drag region", () => {
    const markup = renderToStaticMarkup(<Toolbar title="Studio" />);
    expect(markup).toContain("h-toolbar");
    expect(markup).toContain("[-webkit-app-region:drag]");
  });

  it("scrolls only the pane body, unless the body owns its scroll", () => {
    expect(renderToStaticMarkup(<PaneBody>x</PaneBody>)).toContain(
      "overflow-y-auto"
    );
    const owned = renderToStaticMarkup(<PaneBody scroll={false}>x</PaneBody>);
    expect(owned).not.toContain("overflow-y-auto");
    expect(owned).toContain("flex-col");
  });

  it("stops scrolling for a page whose root owns its scroll, with no list of pages", () => {
    // The page says so on its root; the shell keeps no ids.
    expect(PANE_OWNS_SCROLL).toEqual({ "data-pane-scroll": "own" });
    const markup = renderToStaticMarkup(<PaneBody>x</PaneBody>);
    for (const rule of ["flex", "flex-col", "overflow-y-hidden"]) {
      expect(markup).toContain(`has-[&gt;[data-pane-scroll=own]]:${rule}`);
    }
  });

  it("titles the toolbar with the one window title recipe: 14 px / 600", () => {
    expect(WINDOW_TITLE_CLASS).toContain(
      "text-sm font-semibold text-foreground"
    );
    const markup = renderToStaticMarkup(<Toolbar title="Studio" />);
    // Focusable by script only: the shell moves the focus here after
    // keyboard navigation.
    expect(markup).toContain(
      `<h1 class="${WINDOW_TITLE_CLASS} outline-none" tabindex="-1">Studio</h1>`
    );
  });
});

describe("PaneStrip", () => {
  it("pins a strip under the toolbar: a hairline below, the gutter at the sides", () => {
    const markup = renderToStaticMarkup(
      <PaneStrip className="flex gap-2">filters</PaneStrip>
    );
    expect(markup).toContain('data-slot="pane-strip"');
    for (const token of [
      "shrink-0",
      "border-b",
      "border-border",
      "px-gutter",
      "py-2",
      "gap-2",
    ]) {
      expect(markup).toContain(token);
    }
  });
});

describe("flush sections", () => {
  it("renders PanelSection flush: no card chrome, a 13 px / 600 header, a hairline", () => {
    const markup = renderToStaticMarkup(
      <PanelSection description="Where files go." title="Recording">
        x
      </PanelSection>
    );
    for (const card of ["rounded-panel", "shadow", "bg-card"]) {
      expect(markup).not.toContain(card);
    }
    expect(markup).toContain("border-b");
    expect(markup).toContain("p-gutter");
    // The type tokens: a 13 / 600 header and a 12 px description, and the
    // header is an h2 under the toolbar's h1.
    expect(markup).toContain("text-section");
    expect(markup).toContain("font-semibold");
    expect(markup).toContain("text-meta text-muted-foreground");
    expect(markup).toMatch(/<h2[^>]*>Recording<\/h2>/u);
  });

  it("nests a section under another's heading at level 3", () => {
    render(<PanelSection headingLevel={3} title="Microphone" />);
    expect(
      screen.getByRole("heading", { level: 3, name: "Microphone" })
    ).toBeInTheDocument();
  });

  it("draws no content box for a section that is only its header", () => {
    const { container } = render(
      <PanelSection description="Every scene starts here." title="Scenes" />
    );
    expect(
      container.querySelector("[data-slot=panel-section-content]")
    ).toBeNull();
  });

  it("splits the two ConfigGrid columns with a hairline", () => {
    const markup = renderToStaticMarkup(<ConfigGrid>a</ConfigGrid>);
    expect(markup).toContain("lg:grid-cols-2");
    expect(markup).toContain("lg:[&amp;&gt;*:nth-child(odd)]:border-r");
  });

  it("keeps the PageHeader title for assistive tech and its action in its own row", () => {
    const markup = renderToStaticMarkup(
      <PageHeader
        action={<button type="button">New recording</button>}
        description="Every recording becomes a session."
        title="Library"
      />
    );
    expect(markup).toContain('<h2 class="sr-only">Library</h2>');
    expect(markup).toContain("Every recording becomes a session.");
    expect(markup).toContain('<button type="button">New recording</button>');
  });

  it("packs a gallery's tracks for a dialog, or holds a row to five", () => {
    expect(tracks(renderToStaticMarkup(<Gallery>a</Gallery>))).toContain(
      "180px"
    );
    expect(tracks(renderToStaticMarkup(<Gallery dense>a</Gallery>))).toContain(
      "10rem"
    );
    expect(
      tracks(renderToStaticMarkup(<Gallery rowsOfFive>a</Gallery>))
    ).toContain("/5_-_1px");
  });
});

describe("lists", () => {
  it("sizes rows at 32 px, or 28 px when compact", () => {
    expect(renderToStaticMarkup(<ListRow title="Camera" />)).toContain("h-row");
    expect(renderToStaticMarkup(<ListRow compact title="Camera" />)).toContain(
      "h-row-compact"
    );
  });

  it("groups like things in one inset list split by hairlines", () => {
    const markup = renderToStaticMarkup(
      <GroupedList label="Devices">
        <ListRow title="Camera" />
        <ListRow title="Microphone" />
      </GroupedList>
    );
    expect(markup).toContain('data-slot="grouped-list"');
    expect(markup).toContain("divide-y");
    expect(markup).toContain("divide-border");
    expect(markup).toContain(">Devices<");
    // Rows inside a group are flush; the group owns the radius.
    expect(markup).toContain("in-data-[slot=grouped-list]:rounded-none");
  });

  it("names the group with the section-label recipe", () => {
    expect(SECTION_LABEL).toBe("text-label font-semibold text-subtle");
    render(<SectionLabel as="h3">Setup</SectionLabel>);
    const label = screen.getByRole("heading", { level: 3, name: "Setup" });
    expect(label).toHaveAttribute("data-slot", "section-label");
    expect(label.className).toContain("text-subtle");
  });

  it("is a fact unless it says otherwise", () => {
    const fact = renderToStaticMarkup(<ListRow title="Camera" />);
    expect(fact).not.toContain("hover:bg-accent");
    expect(fact).toMatch(/^<div/u);
    // A row as one button acts, with the hover and the focus ring.
    const onClick = vi.fn();
    render(<ListRow as="button" onClick={onClick} title="FaceTime HD" />);
    const row = screen.getByRole("button", { name: "FaceTime HD" });
    expect(row).toHaveAttribute("type", "button");
    expect(row.className).toContain("hover:bg-accent");
    expect(row.className).toContain("focus-visible:ring-2");
    fireEvent.click(row);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("marks the selected row and draws it as the accent block", () => {
    render(<ListRow selected title="Main scene" />);
    const row = screen.getByText("Main scene").closest("[data-slot=list-row]");
    expect(row).toHaveAttribute("data-selected", "true");
    expect(row?.className).toContain("bg-accent");
  });

  it("stretches a ListRowButton over its row, beside a control that stays its sibling", () => {
    render(
      <ListRow className="relative" title={<ListRowButton>Desk</ListRowButton>}>
        <input aria-label="Show Desk" className="relative" type="checkbox" />
      </ListRow>
    );
    const button = screen.getByRole("button", { name: "Desk" });
    expect(button.className).toContain("after:absolute");
    expect(button.className).toContain("after:inset-0");
    expect(button.contains(screen.getByRole("checkbox"))).toBe(false);
  });
});

describe("StatusBar", () => {
  it("is 26 px with quiet, clickable hints", () => {
    const onClick = vi.fn();
    const { container } = render(
      <StatusBar leading={<span>Connected</span>}>
        <StatusBarHint
          accelerator="CmdOrCtrl+K"
          label="Search"
          onClick={onClick}
          platform="darwin"
        />
      </StatusBar>
    );
    const bar = container.querySelector("[data-slot=status-bar]");
    expect(bar?.className).toContain("h-status-bar");
    expect(bar?.textContent).toContain("Connected");
    const hint = container.querySelector<HTMLButtonElement>(
      "[data-slot=status-bar-hint]"
    );
    expect(hint?.textContent).toBe("⌘KSearch");
    if (hint) {
      fireEvent.click(hint);
    }
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("prints the hint's key per platform and marks an open window as pressed", () => {
    render(
      <StatusBarHint
        accelerator="CmdOrCtrl+Shift+J"
        label="Stream Manager"
        onClick={vi.fn()}
        platform="win32"
        pressed
      />
    );
    const hint = screen.getByRole("button", { pressed: true });
    expect(hint.textContent).toBe("Ctrl+Shift+JStream Manager");
  });
});

describe("StatusBarAction", () => {
  it("names an icon-only action for assistive tech and on hover", () => {
    const onClick = vi.fn();
    const { container } = render(
      <StatusBarAction
        icon={<svg aria-hidden />}
        label="Open Preview"
        onClick={onClick}
      />
    );
    const action = container.querySelector<HTMLButtonElement>(
      "[data-slot=status-bar-action]"
    );
    expect(action?.getAttribute("aria-label")).toBe("Open Preview");
    // Named on hover by a tooltip, never a native title.
    expect(action?.hasAttribute("title")).toBe(false);
    expect(action?.dataset.popupOpen).toBeUndefined();
    expect(action?.getAttribute("type")).toBe("button");
    expect(action?.className).toContain(STATUS_BAR_ACTION_CLASS);
    if (action) {
      fireEvent.click(action);
    }
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("shows a word when it has one, keeps the full name, and marks a toggle that is on", () => {
    const markup = renderToStaticMarkup(
      <StatusBarAction
        hint="Clear view (keeps Library history)"
        label="Clear view"
        pressed
        text="Clear"
      />
    );
    expect(markup).toContain('aria-label="Clear view"');
    expect(markup).toContain('aria-pressed="true"');
    // The hint is the tooltip and the description, never a title.
    expect(markup).toContain(
      'aria-description="Clear view (keeps Library history)"'
    );
    expect(markup).not.toContain("title=");
    expect(markup).toContain(">Clear</button>");
  });

  it("shares one look with the shortcut hints", () => {
    for (const token of [
      "h-5",
      "text-label",
      "font-normal",
      "text-subtle",
      "hover:bg-accent",
    ]) {
      expect(STATUS_BAR_ACTION_CLASS).toContain(token);
    }
    const { container } = render(
      <StatusBarHint
        accelerator="CmdOrCtrl+K"
        label="Search"
        onClick={vi.fn()}
      />
    );
    const hint = container.querySelector("[data-slot=status-bar-hint]");
    expect(hint?.className).toBe(STATUS_BAR_ACTION_CLASS);
  });

  it("keeps its slot as a menu trigger's render", () => {
    // A trigger hands its own props (and its own slot) to the element it
    // renders; the slot lands after the spread.
    render(
      <StatusBarAction
        aria-haspopup="menu"
        data-slot="dropdown-menu-trigger"
        label="Clip length"
        text="30 s"
      />
    );
    const action = screen.getByRole("button", { name: "Clip length" });
    expect(action).toHaveAttribute("data-slot", "status-bar-action");
    expect(action).toHaveAttribute("aria-haspopup", "menu");
  });
});
