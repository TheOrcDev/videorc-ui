"use client";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";

// A toast with a description stays at least 8 s, long enough to read it.
const TOAST_WITH_DESCRIPTION_MS = 8000;

const SonnerDemo = () => (
  <Button
    onClick={() =>
      toast.success("Recording saved", {
        description: "Just chatting, 1:12:04, is in your Library.",
        duration: TOAST_WITH_DESCRIPTION_MS,
      })
    }
    variant="secondary"
  >
    Save local recording
  </Button>
);

export default SonnerDemo;
