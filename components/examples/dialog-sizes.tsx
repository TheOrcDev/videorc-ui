"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { DialogSize } from "@/components/ui/dialog";

const SIZES: { size: DialogSize; title: string; use: string }[] = [
  { size: "sm", title: "Rename scene", use: "384 px: a rename, one question." },
  {
    size: "md",
    title: "Delete saved scene?",
    use: "448 px, the default: confirmations and short forms.",
  },
  {
    size: "lg",
    title: "Set up your microphone",
    use: "576 px: forms, pickers and setup.",
  },
  {
    size: "xl",
    title: "Go Live",
    use: "768 px: review and media, such as Go Live and markers.",
  },
];

const DialogSizes = () => (
  <div className="flex flex-wrap items-center gap-2">
    {SIZES.map(({ size, title, use }) => (
      <Dialog key={size}>
        <DialogTrigger render={<Button variant="secondary" />}>
          {size}
        </DialogTrigger>
        <DialogContent size={size}>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{use}</DialogDescription>
          </DialogHeader>
          <DialogFooter showCloseButton />
        </DialogContent>
      </Dialog>
    ))}
  </div>
);

export default DialogSizes;
