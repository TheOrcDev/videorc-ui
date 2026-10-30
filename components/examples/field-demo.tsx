"use client";

import { useState } from "react";

import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

const TITLE_MAX = 100;

const FieldDemo = () => {
  const [title, setTitle] = useState("Friday night speedruns");
  return (
    <FieldSet className="w-full max-w-sm">
      <FieldLegend>Stream details</FieldLegend>
      <FieldGroup>
        <Field>
          <div className="flex items-baseline justify-between gap-2">
            <FieldLabel>Title</FieldLabel>
            <span
              aria-hidden
              className="text-meta text-muted-foreground tabular-nums"
            >
              {title.length}/{TITLE_MAX}
            </span>
          </div>
          <Input
            maxLength={TITLE_MAX}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Untitled livestream"
            value={title}
          />
        </Field>
        <Field>
          <FieldLabel>Description</FieldLabel>
          <Textarea placeholder="Optional" />
        </Field>
        <Field orientation="horizontal">
          <FieldContent>
            <FieldLabel>Made for kids</FieldLabel>
            <FieldDescription>
              YouTube asks every stream to say whether it&apos;s made for kids.
            </FieldDescription>
          </FieldContent>
          <Switch />
        </Field>
      </FieldGroup>
    </FieldSet>
  );
};

export default FieldDemo;
