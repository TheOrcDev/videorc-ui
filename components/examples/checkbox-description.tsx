"use client";

import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";

const CheckboxDescription = () => (
  <FieldGroup className="max-w-sm">
    <Field orientation="horizontal">
      <Checkbox defaultChecked />
      <FieldContent>
        <FieldLabel>Keep original recording</FieldLabel>
        <FieldDescription>
          Clean cut saves a new file and leaves the original where it is.
        </FieldDescription>
      </FieldContent>
    </Field>
    <Field data-disabled="true" orientation="horizontal">
      <Checkbox disabled />
      <FieldContent>
        <FieldLabel>Upload to YouTube when it ends</FieldLabel>
        <FieldDescription>
          Connect YouTube in Livestream first.
        </FieldDescription>
      </FieldContent>
    </Field>
  </FieldGroup>
);

export default CheckboxDescription;
