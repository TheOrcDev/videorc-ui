"use client";

import { useState } from "react";

import {
  AssetsIcon,
  LivestreamIcon,
  SceneIcon,
  SourcesIcon,
  StudioIcon,
} from "@/components/icons";
import { ListRow } from "@/components/list-row";
import { SectionLabel } from "@/components/section-label";
import { ShortcutKeys } from "@/components/ui/shortcut-keys";

const SETUP = [
  { accelerator: "CmdOrCtrl+2", icon: SourcesIcon, name: "Sources" },
  { accelerator: "CmdOrCtrl+3", icon: SceneIcon, name: "Scene" },
  { accelerator: "CmdOrCtrl+4", icon: AssetsIcon, name: "Assets" },
  { accelerator: "CmdOrCtrl+5", icon: LivestreamIcon, name: "Livestream" },
] as const;

const SectionLabelDemo = () => {
  const [page, setPage] = useState<string>("Sources");
  return (
    <nav
      aria-label="Pages"
      className="bg-glass-sidebar rounded-panel flex w-56 flex-col gap-3 border p-2"
    >
      <ListRow
        as="button"
        compact
        icon={<StudioIcon />}
        meta={<ShortcutKeys accelerator="CmdOrCtrl+1" variant="text" />}
        onClick={() => setPage("Studio")}
        selected={page === "Studio"}
        title="Studio"
      />
      <div className="flex flex-col gap-0.5">
        <SectionLabel as="h3" className="px-3 pb-1">
          Setup
        </SectionLabel>
        {SETUP.map(({ accelerator, icon: Icon, name }) => (
          <ListRow
            aria-current={page === name ? "page" : undefined}
            as="button"
            compact
            icon={<Icon />}
            key={name}
            meta={<ShortcutKeys accelerator={accelerator} variant="text" />}
            onClick={() => setPage(name)}
            selected={page === name}
            title={name}
          />
        ))}
      </div>
    </nav>
  );
};

export default SectionLabelDemo;
