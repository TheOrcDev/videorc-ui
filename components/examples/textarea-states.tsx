"use client";

import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";

const TextareaStates = () => (
  <FieldGroup className="max-w-sm">
    <Field>
      <FieldLabel>Description</FieldLabel>
      <Textarea aria-invalid defaultValue="Speedrun night <3" />
      <FieldError>Descriptions can&apos;t contain &lt; or &gt;.</FieldError>
    </Field>
    <Field data-disabled="true">
      <FieldLabel>Notes</FieldLabel>
      <Textarea defaultValue="Thank the raid, then switch scenes." disabled />
      <FieldDescription>
        Locked while you&apos;re recording or live.
      </FieldDescription>
    </Field>
  </FieldGroup>
);

export default TextareaStates;
