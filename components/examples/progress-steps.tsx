"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Progress,
  ProgressLabel,
  ProgressValue,
} from "@/components/ui/progress";

const POSES = 8;

const ProgressSteps = () => {
  const [done, setDone] = useState(3);
  return (
    <div className="flex w-full max-w-xs flex-col items-start gap-3">
      <Progress max={POSES} value={done}>
        <ProgressLabel>Cutting out poses</ProgressLabel>
        <ProgressValue>
          {(_, value) => `${value ?? 0} of ${POSES}`}
        </ProgressValue>
      </Progress>
      <Button
        disabled={done === POSES}
        onClick={() => setDone((count) => Math.min(POSES, count + 1))}
        size="xs"
        variant="secondary"
      >
        Next pose
      </Button>
    </div>
  );
};

export default ProgressSteps;
