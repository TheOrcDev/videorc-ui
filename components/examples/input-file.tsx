"use client";

import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

const InputFile = () => (
  <Field className="max-w-sm">
    <FieldLabel>Thumbnail</FieldLabel>
    <Input accept="image/png,image/jpeg" type="file" />
    <FieldDescription>A 1280 × 720 PNG or JPEG, up to 2 MB.</FieldDescription>
  </Field>
);

export default InputFile;
