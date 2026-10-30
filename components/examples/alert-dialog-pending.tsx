"use client";

import { useState } from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

const DELETE_TAKES_MS = 1500;

const AlertDialogPending = () => {
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // The dialog stays up, saying "Deleting…", until the work is done: then
  // the owner closes it.
  const confirm = () => {
    setDeleting(true);
    setTimeout(() => {
      setDeleting(false);
      setOpen(false);
    }, DELETE_TAKES_MS);
  };

  return (
    <AlertDialog
      onOpenChange={(next) => {
        if (!deleting) {
          setOpen(next);
        }
      }}
      open={open}
    >
      <AlertDialogTrigger render={<Button variant="destructive" />}>
        Delete recording…
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete recording?</AlertDialogTitle>
          <AlertDialogDescription>
            The recording and its markers move to the Trash.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={deleting}
            onClick={confirm}
            variant="destructive"
          >
            {deleting ? "Deleting…" : "Delete recording"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default AlertDialogPending;
