"use client";

import { ChevronDownIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

const ENCODER_SETTINGS = [
  { label: "Keyframe interval", value: "2 s" },
  { label: "B-frames", value: "2" },
  { label: "Encoder preset", value: "Quality" },
];

const CollapsibleDemo = () => (
  <Collapsible className="w-full max-w-xs">
    <CollapsibleTrigger render={<Button variant="ghost" />}>
      Advanced settings
      <ChevronDownIcon
        className="transition-transform duration-150 ease-out group-data-panel-open/button:rotate-180"
        data-icon="inline-end"
      />
    </CollapsibleTrigger>
    <CollapsibleContent>
      <dl className="mt-2 flex flex-col gap-1 px-3 text-sm">
        {ENCODER_SETTINGS.map((setting) => (
          <div className="flex justify-between gap-4" key={setting.label}>
            <dt className="text-muted-foreground">{setting.label}</dt>
            <dd>{setting.value}</dd>
          </div>
        ))}
      </dl>
    </CollapsibleContent>
  </Collapsible>
);

export default CollapsibleDemo;
