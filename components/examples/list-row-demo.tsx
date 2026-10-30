"use client";

import { CameraIcon, MicrophoneIcon, WarningIcon } from "@/components/icons";
import { GroupedList, ListRow } from "@/components/list-row";

const ListRowDemo = () => (
  <div className="flex w-full max-w-md flex-col gap-4">
    <GroupedList aria-label="Cameras" label="Cameras">
      <ListRow
        context="Built-in"
        icon={<CameraIcon />}
        meta="In use"
        title="FaceTime HD Camera"
      />
      <ListRow
        context="USB"
        icon={<CameraIcon />}
        meta="Connected"
        title="Sony ZV-E10"
      />
    </GroupedList>
    <GroupedList aria-label="Microphones" label="Microphones">
      <ListRow
        context="USB"
        icon={<MicrophoneIcon />}
        meta="In use"
        title="Shure MV7"
      />
      <ListRow
        context="Bluetooth"
        icon={<MicrophoneIcon />}
        meta="Not responding"
        statusIcons={<WarningIcon aria-hidden />}
        title="AirPods Pro"
      />
    </GroupedList>
  </div>
);

export default ListRowDemo;
