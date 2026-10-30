"use client";

import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

const InputDemo = () => (
  <Field className="max-w-sm">
    <FieldLabel>Stream title</FieldLabel>
    <Input placeholder="Untitled livestream" />
  </Field>
);

export default InputDemo;
