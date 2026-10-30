"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldLabel } from "@/components/ui/field";

const CheckboxDemo = () => (
  <Field orientation="horizontal">
    <Checkbox defaultChecked />
    <FieldLabel>Include markers in the export</FieldLabel>
  </Field>
);

export default CheckboxDemo;
