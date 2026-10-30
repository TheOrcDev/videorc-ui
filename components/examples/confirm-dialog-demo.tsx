"use client";

import { useState } from "react";

import { ConfirmDialog } from "@/components/confirm-dialog";
import { Button } from "@/components/ui/button";

const DELETE_TAKES_MS = 1500;

const ConfirmDialogDemo = () => {
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
    <>
      <Button onClick={() => setOpen(true)} variant="destructive">
        Delete saved scene…
      </Button>
      <ConfirmDialog
        cancelDisabled={deleting}
        confirmDisabled={deleting}
        confirmLabel={deleting ? "Deleting…" : "Delete scene"}
        description="Only the saved snapshot is deleted. Your current scene and recording continue."
        onCancel={() => {
          if (!deleting) {
            setOpen(false);
          }
        }}
        onConfirm={confirm}
        open={open}
        title="Delete saved scene?"
      />
    </>
  );
};

export default ConfirmDialogDemo;
