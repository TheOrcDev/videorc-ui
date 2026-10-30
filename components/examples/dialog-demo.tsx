"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

const DialogDemo = () => (
  <Dialog>
    <DialogTrigger render={<Button variant="secondary" />}>
      Rename scene…
    </DialogTrigger>
    <DialogContent size="sm">
      <DialogHeader>
        <DialogTitle>Rename scene</DialogTitle>
        <DialogDescription>
          The new name shows in the Studio and in Scene.
        </DialogDescription>
      </DialogHeader>
      <Field>
        <FieldLabel>Name</FieldLabel>
        <Input defaultValue="Just chatting" />
      </Field>
      <DialogFooter>
        <DialogClose render={<Button variant="ghost" />}>Cancel</DialogClose>
        <DialogClose render={<Button />}>Save</DialogClose>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

export default DialogDemo;
