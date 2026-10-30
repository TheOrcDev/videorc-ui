"use client";

import { useState } from "react";

import { RecordIcon, StopIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";

const ButtonRecord = () => {
  const [recording, setRecording] = useState(false);
  return (
    <Button
      data-lit={recording ? "" : undefined}
      onClick={() => setRecording((value) => !value)}
      variant="record"
    >
      {recording ? (
        <StopIcon data-icon="inline-start" weight="fill" />
      ) : (
        <RecordIcon data-icon="inline-start" weight="fill" />
      )}
      {recording ? "Stop recording" : "Record"}
    </Button>
  );
};

export default ButtonRecord;
