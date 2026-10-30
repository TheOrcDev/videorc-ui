"use client";

import { useState } from "react";

import { ConfirmDialog } from "@/components/confirm-dialog";
import { Button } from "@/components/ui/button";

const ConfirmDialogReplace = () => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)} variant="secondary">
        Use for Go Live…
      </Button>
      <ConfirmDialog
        cancelLabel="Keep current details"
        confirmLabel="Replace details"
        confirmVariant="default"
        description="The title, description and privacy from this event replace what you've typed in Livestream → Setup."
        onCancel={() => setOpen(false)}
        onConfirm={() => setOpen(false)}
        open={open}
        title="Replace stream details?"
      />
    </>
  );
};

export default ConfirmDialogReplace;
