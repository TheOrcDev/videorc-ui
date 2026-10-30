"use client";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";

const SAVE_TAKES_MS = 2000;

// One id per kind of toast: the saved toast replaces the pending one.
const saveRecording = () => {
  toast.loading("Saving recording…", { id: "recording-save" });
  setTimeout(() => {
    toast.success("Recording saved", { id: "recording-save" });
  }, SAVE_TAKES_MS);
};

const SonnerTypes = () => (
  <div className="flex flex-wrap items-center gap-2">
    <Button
      onClick={() => toast.success("Import complete")}
      variant="secondary"
    >
      Success
    </Button>
    <Button
      onClick={() => toast.info("Finish connecting YouTube in your browser")}
      variant="secondary"
    >
      Info
    </Button>
    <Button
      onClick={() =>
        toast.warning(
          "Renaming takeovers is locked while you're recording or live"
        )
      }
      variant="secondary"
    >
      Warning
    </Button>
    <Button
      onClick={() =>
        toast.error("Couldn't connect to Twitch", {
          description: "Check your connection, then try again.",
        })
      }
      variant="secondary"
    >
      Error
    </Button>
    <Button onClick={saveRecording} variant="secondary">
      Loading
    </Button>
  </div>
);

export default SonnerTypes;
