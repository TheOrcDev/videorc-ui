"use client";

import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

const InputStates = () => (
  <FieldGroup className="max-w-sm">
    <Field>
      <FieldLabel>Output width</FieldLabel>
      <Input aria-invalid defaultValue="1919" inputMode="numeric" />
      <FieldError>Width must be even.</FieldError>
    </Field>
    <Field data-disabled="true">
      <FieldLabel>Recordings folder</FieldLabel>
      <Input defaultValue="~/Movies/Videorc" disabled />
      <FieldDescription>
        Locked while you&apos;re recording or live.
      </FieldDescription>
    </Field>
  </FieldGroup>
);

export default InputStates;
