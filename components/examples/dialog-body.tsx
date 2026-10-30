"use client";

import { MarkerIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const MARKERS = Array.from({ length: 24 }, (_, index) => ({
  id: `marker-${index + 1}`,
  label: `Marker ${index + 1}`,
  time: `0:${String(index * 2 + 3).padStart(2, "0")}:12`,
}));

const DialogBodyExample = () => (
  <Dialog>
    <DialogTrigger render={<Button variant="secondary" />}>
      <MarkerIcon data-icon="inline-start" />
      Review markers…
    </DialogTrigger>
    <DialogContent size="lg">
      <DialogHeader>
        <DialogTitle>Markers</DialogTitle>
        <DialogDescription>
          24 markers in this recording. Jump to one to review it.
        </DialogDescription>
      </DialogHeader>
      <DialogBody>
        <ul className="divide-border divide-y">
          {MARKERS.map((marker) => (
            <li
              className="h-row flex items-center justify-between text-sm"
              key={marker.id}
            >
              {marker.label}
              <span className="text-meta text-muted-foreground tabular-nums">
                {marker.time}
              </span>
            </li>
          ))}
        </ul>
      </DialogBody>
      <DialogFooter>
        <DialogClose render={<Button />}>Done</DialogClose>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

export default DialogBodyExample;
