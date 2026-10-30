"use client";

import { useState } from "react";

import { SceneIcon } from "@/components/icons";
import { GroupedList, ListRow } from "@/components/list-row";

const SCENES = [
  { name: "Just chatting", sources: "2 sources" },
  { name: "Gameplay", sources: "4 sources" },
  { name: "Be right back", sources: "1 source" },
] as const;

const ListRowButtonExample = () => {
  const [scene, setScene] = useState<string>("Gameplay");
  return (
    <GroupedList aria-label="Scenes" className="w-full max-w-xs" label="Scenes">
      {SCENES.map(({ name, sources }) => (
        <ListRow
          aria-pressed={scene === name}
          as="button"
          compact
          icon={<SceneIcon />}
          key={name}
          meta={sources}
          onClick={() => setScene(name)}
          selected={scene === name}
          title={name}
        />
      ))}
    </GroupedList>
  );
};

export default ListRowButtonExample;
