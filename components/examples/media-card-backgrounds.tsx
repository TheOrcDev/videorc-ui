"use client";

import { DeleteIcon, EditIcon, ImageIcon } from "@/components/icons";
import { KebabMenu } from "@/components/kebab-menu";
import { MediaCard } from "@/components/media-card";

const BACKGROUNDS = ["Studio wall", "Night city", "Soft gradient"];

const noop = () => {
  // A demo: the actions do nothing.
};

const MediaCardBackgrounds = () => (
  <div className="grid w-full max-w-lg grid-cols-3 gap-3">
    {BACKGROUNDS.map((name) => (
      <MediaCard className="group/kebab-host gap-2 p-2" key={name}>
        <div className="bg-muted text-muted-foreground rounded-chip flex aspect-video items-center justify-center">
          <ImageIcon aria-hidden className="size-6" weight="duotone" />
        </div>
        <div className="flex items-center gap-1">
          <span className="min-w-0 flex-1 truncate text-sm">{name}</span>
          <KebabMenu
            items={[
              {
                icon: EditIcon,
                id: "rename",
                label: "Rename…",
                onSelect: noop,
              },
              {
                destructive: true,
                icon: DeleteIcon,
                id: "delete",
                label: "Delete",
                onSelect: noop,
              },
            ]}
            label={`Actions for ${name}`}
            reveal="hover"
          />
        </div>
      </MediaCard>
    ))}
  </div>
);

export default MediaCardBackgrounds;
