"use client";

import { useState } from "react";

import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";

const RECORDINGS = [
  "Friday night speedruns",
  "Q&A with chat",
  "Studio test, take 3",
];

const CheckboxIndeterminate = () => {
  const [selected, setSelected] = useState(RECORDINGS.slice(0, 1));
  const all = selected.length === RECORDINGS.length;
  const some = selected.length > 0 && !all;
  return (
    <div className="flex max-w-xs flex-col gap-3">
      <Field orientation="horizontal">
        <Checkbox
          checked={all}
          indeterminate={some}
          onCheckedChange={() => setSelected(all ? [] : RECORDINGS)}
        />
        <FieldLabel>Select all recordings in view</FieldLabel>
      </Field>
      <div className="pl-6">
        <FieldGroup data-slot="checkbox-group">
          {RECORDINGS.map((recording) => (
            <Field key={recording} orientation="horizontal">
              <Checkbox
                checked={selected.includes(recording)}
                onCheckedChange={(checked) =>
                  setSelected((current) =>
                    checked
                      ? [...current, recording]
                      : current.filter((item) => item !== recording)
                  )
                }
              />
              <FieldLabel>{recording}</FieldLabel>
            </Field>
          ))}
        </FieldGroup>
      </div>
    </div>
  );
};

export default CheckboxIndeterminate;
