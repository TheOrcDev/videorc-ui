"use client";

import { Field, FieldLabel } from "@/components/ui/field";
import { Slider } from "@/components/ui/slider";

const SliderDemo = () => (
  <Field className="max-w-sm">
    <FieldLabel>Buddy motion</FieldLabel>
    <Slider defaultValue={45} />
  </Field>
);

export default SliderDemo;
