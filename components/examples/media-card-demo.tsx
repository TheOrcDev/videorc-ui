"use client";

import { useState } from "react";

import { CameraIcon, DisplayIcon, SceneIcon } from "@/components/icons";
import type { AppIcon } from "@/components/icons";
import { MediaCard } from "@/components/media-card";

const SCENES: { id: string; name: string; icon: AppIcon }[] = [
  { icon: SceneIcon, id: "screen-camera", name: "Screen + camera" },
  { icon: DisplayIcon, id: "screen", name: "Screen only" },
  { icon: CameraIcon, id: "camera", name: "Camera only" },
];

const MediaCardDemo = () => {
  const [current, setCurrent] = useState("screen-camera");
  return (
    <div className="grid w-full max-w-lg grid-cols-3 gap-3">
      {SCENES.map((scene) => (
        <MediaCard
          aria-pressed={scene.id === current}
          className="gap-2 p-2 text-left"
          interactive
          key={scene.id}
          onClick={() => setCurrent(scene.id)}
          // oxlint-disable-next-line jsx-a11y/control-has-associated-label -- Base UI renders the label into it.
          render={<button type="button" />}
          selected={scene.id === current}
        >
          <span className="bg-muted text-muted-foreground rounded-chip flex aspect-video items-center justify-center">
            <scene.icon aria-hidden className="size-6" weight="duotone" />
          </span>
          <span className="truncate text-sm font-medium">{scene.name}</span>
        </MediaCard>
      ))}
    </div>
  );
};

export default MediaCardDemo;
