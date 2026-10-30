"use client";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";

const SonnerUndo = () => (
  <Button
    onClick={() =>
      toast("Message removed", {
        action: {
          label: "Undo",
          onClick: () => toast("Message restored"),
        },
        duration: Number.POSITIVE_INFINITY,
        id: "chat-removal",
      })
    }
    variant="secondary"
  >
    Remove message
  </Button>
);

export default SonnerUndo;
