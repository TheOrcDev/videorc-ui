"use client";

import type { ComponentType, ReactNode } from "react";

import { examples } from "@/components/docs/example-registry";
import {
  CameraIcon,
  ChatIcon,
  ClipIcon,
  LibraryIcon,
  LivestreamIcon,
  MicrophoneIcon,
  RecordIcon,
  SceneIcon,
  SourcesIcon,
  StudioIcon,
  ViewersIcon,
  WaveformIcon,
} from "@/components/icons";
import type { AppIcon } from "@/components/icons";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import type { socialCompositions } from "@/lib/social-catalog";

const Example = ({ name }: { name: string }) => {
  const Demo = examples[name];
  if (!Demo) {
    throw new Error(`The social card preview "${name}" has no example.`);
  }
  return <Demo />;
};

const Tile = ({ children }: { children: ReactNode }) => (
  <div className="rounded-panel bg-glass-solid flex min-w-0 items-center justify-center border p-4">
    {children}
  </div>
);

/** A handful of the library's controls, side by side. */
const Collection = () => (
  <div className="grid w-full grid-cols-2 gap-3">
    <div className="col-span-2">
      <Tile>
        <div className="flex items-center gap-2">
          <Button variant="record">
            <RecordIcon data-icon="inline-start" weight="fill" />
            Record
          </Button>
          <Button>Go Live…</Button>
          <Button variant="secondary">Open Preview</Button>
        </div>
      </Tile>
    </div>
    <Tile>
      <Example name="segmented-control-demo" />
    </Tile>
    <Tile>
      <Example name="slider-demo" />
    </Tile>
    <div className="col-span-2">
      <Tile>
        <div className="flex items-center gap-2">
          <StatusBadge tone="good" value="Connected" />
          <StatusBadge tone="warn" value="Reconnecting" />
          <StatusBadge tone="live" value="On air" />
        </div>
      </Tile>
    </div>
  </div>
);

const ICONS: [string, AppIcon][] = [
  ["Record", RecordIcon],
  ["Go Live", LivestreamIcon],
  ["Studio", StudioIcon],
  ["Sources", SourcesIcon],
  ["Scene", SceneIcon],
  ["Camera", CameraIcon],
  ["Mic", MicrophoneIcon],
  ["Waveform", WaveformIcon],
  ["Chat", ChatIcon],
  ["Viewers", ViewersIcon],
  ["Clip", ClipIcon],
  ["Library", LibraryIcon],
];

const Icons = () => (
  <ul className="grid w-full grid-cols-6 gap-2">
    {ICONS.map(([label, Icon]) => (
      <li
        className="rounded-row bg-glass-solid text-meta flex flex-col items-center gap-2 border px-1 py-3"
        key={label}
      >
        <Icon className="size-6" />
        <span className="text-muted-foreground truncate">{label}</span>
      </li>
    ))}
  </ul>
);

/** The theme's surfaces: chrome, glass, the record LED and the tones. */
const Theme = () => (
  <div className="grid w-full grid-cols-3 gap-3">
    <Tile>
      <Button>Go Live…</Button>
    </Tile>
    <Tile>
      <Button variant="secondary">Open Preview</Button>
    </Tile>
    <Tile>
      <Button variant="record">
        <RecordIcon data-icon="inline-start" weight="fill" />
        Record
      </Button>
    </Tile>
    <div className="col-span-3">
      <Tile>
        <div className="flex flex-wrap items-center justify-center gap-2">
          <StatusBadge tone="good" value="Connected" />
          <StatusBadge tone="warn" value="Reconnecting" />
          <StatusBadge tone="error" value="Upload failed" />
          <StatusBadge tone="live" value="On air" />
          <StatusBadge value="Idle" />
        </div>
      </Tile>
    </div>
  </div>
);

const compositions: Record<(typeof socialCompositions)[number], ComponentType> =
  {
    collection: Collection,
    icons: Icons,
    theme: Theme,
  };

const isComposition = (
  name: string
): name is (typeof socialCompositions)[number] => name in compositions;

export const SocialPreview = ({ name }: { name: string }) => {
  if (isComposition(name)) {
    const Composition = compositions[name];
    return <Composition />;
  }
  return <Example name={name} />;
};
