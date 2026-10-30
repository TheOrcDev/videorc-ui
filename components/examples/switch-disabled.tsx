"use client";

import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
} from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";

const SwitchDisabled = () => (
  <Field className="max-w-sm" data-disabled="true" orientation="horizontal">
    <FieldContent>
      <FieldLabel>Save local recording</FieldLabel>
      <FieldDescription>
        Locked while you&apos;re recording or live.
      </FieldDescription>
    </FieldContent>
    <Switch defaultChecked disabled />
  </Field>
);

export default SwitchDisabled;
