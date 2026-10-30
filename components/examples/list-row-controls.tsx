"use client";

import { useState } from "react";

import { TwitchIcon, YoutubeIcon } from "@/components/icons";
import { GroupedList, ListRow, ListRowButton } from "@/components/list-row";
import { Switch } from "@/components/ui/switch";

const DESTINATIONS = [
  {
    account: "Maya Streams",
    icon: <YoutubeIcon className="text-platform-youtube" weight="fill" />,
    id: "youtube",
    name: "YouTube",
  },
  {
    account: "maya_streams",
    icon: <TwitchIcon className="text-platform-twitch-ink" weight="fill" />,
    id: "twitch",
    name: "Twitch",
  },
] as const;

const ListRowControls = () => {
  const [selected, setSelected] = useState<string>("youtube");
  const [on, setOn] = useState<Record<string, boolean>>({
    twitch: false,
    youtube: true,
  });
  return (
    <GroupedList
      aria-label="Destinations"
      className="w-full max-w-md"
      label="Destinations"
    >
      {DESTINATIONS.map((destination) => (
        <ListRow
          className="relative"
          context={destination.account}
          icon={destination.icon}
          interactive
          key={destination.id}
          selected={selected === destination.id}
          title={
            <ListRowButton onClick={() => setSelected(destination.id)}>
              {destination.name}
            </ListRowButton>
          }
        >
          <Switch
            aria-label={`Stream to ${destination.name}`}
            checked={on[destination.id]}
            onCheckedChange={(checked) =>
              setOn((current) => ({ ...current, [destination.id]: checked }))
            }
          />
        </ListRow>
      ))}
    </GroupedList>
  );
};

export default ListRowControls;
