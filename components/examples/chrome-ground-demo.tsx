"use client";

import { ChromeGround } from "@/components/chrome-ground";
import { LibraryIcon, SourcesIcon, StudioIcon } from "@/components/icons";
import { Pane, PaneBody, Toolbar } from "@/components/pane";

const PAGES = [
  { icon: StudioIcon, name: "Studio" },
  { icon: SourcesIcon, name: "Sources" },
  { icon: LibraryIcon, name: "Library" },
] as const;

const ChromeGroundDemo = () => (
  // In a window the ground is fixed to the viewport; here it's held inside
  // the frame, which `isolate` keeps it under.
  <div className="rounded-panel relative isolate flex h-72 w-full max-w-xl overflow-hidden border">
    <ChromeGround
      className="absolute"
      dark="/chrome-ground/dark.webp"
      light="/chrome-ground/light.webp"
    />
    <aside
      aria-label="Pages"
      className="bg-glass-sidebar flex w-40 shrink-0 flex-col gap-0.5 border-r p-2 pt-12"
    >
      {PAGES.map(({ icon: Icon, name }) => (
        <span
          className="h-row-compact rounded-chip flex items-center gap-2 px-2 text-sm"
          key={name}
        >
          <Icon className="text-muted-foreground size-4" />
          {name}
        </span>
      ))}
    </aside>
    <Pane className="bg-glass-content">
      <Toolbar title="Studio" />
      <PaneBody className="p-gutter text-muted-foreground text-sm">
        The sidebar is the heavier coat; the pane shows more of the chrome under
        it.
      </PaneBody>
    </Pane>
  </div>
);

export default ChromeGroundDemo;
