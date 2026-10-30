"use client";

import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";

const TextareaDemo = () => (
  <Field className="max-w-sm">
    <FieldLabel>Description</FieldLabel>
    <Textarea placeholder="Optional" />
    <FieldDescription>Shown under the livestream on YouTube.</FieldDescription>
  </Field>
);

export default TextareaDemo;
