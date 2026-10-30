"use client";

import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
} from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";

const SwitchDemo = () => (
  <Field className="max-w-sm" orientation="horizontal">
    <FieldContent>
      <FieldLabel>Made for kids</FieldLabel>
      <FieldDescription>
        YouTube asks every stream to say whether it&apos;s made for kids.
      </FieldDescription>
    </FieldContent>
    <Switch />
  </Field>
);

export default SwitchDemo;
