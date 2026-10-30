"use client";

import { Field, FieldLabel } from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";

const SwitchSizes = () => (
  <div className="flex max-w-xs flex-col gap-3">
    <Field orientation="horizontal">
      <FieldLabel>System audio</FieldLabel>
      <Switch defaultChecked />
    </Field>
    <Field orientation="horizontal">
      <FieldLabel>Show on stream</FieldLabel>
      <Switch defaultChecked size="sm" />
    </Field>
  </div>
);

export default SwitchSizes;
