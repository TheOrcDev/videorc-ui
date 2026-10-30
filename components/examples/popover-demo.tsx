"use client";

import { useState } from "react";

import { MarkerIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";

const PopoverDemo = () => {
  const [open, setOpen] = useState(false);
  return (
    <Popover onOpenChange={setOpen} open={open}>
      <PopoverTrigger render={<Button variant="secondary" />}>
        <MarkerIcon data-icon="inline-start" />
        Add marker…
      </PopoverTrigger>
      <PopoverContent align="start">
        <PopoverHeader>
          <PopoverTitle>Add a marker</PopoverTitle>
          <PopoverDescription>
            Marks this moment, so you can find it in the recording later.
          </PopoverDescription>
        </PopoverHeader>
        <Field>
          <FieldLabel>Note</FieldLabel>
          <Input defaultValue="Viewer question about the mixer" />
        </Field>
        <Button className="self-end" onClick={() => setOpen(false)}>
          Add marker
        </Button>
      </PopoverContent>
    </Popover>
  );
};

export default PopoverDemo;
