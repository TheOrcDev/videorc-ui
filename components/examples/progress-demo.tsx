"use client";

import {
  Progress,
  ProgressLabel,
  ProgressValue,
} from "@/components/ui/progress";

const ProgressDemo = () => (
  <Progress className="max-w-xs" value={42}>
    <ProgressLabel>Uploading recording…</ProgressLabel>
    <ProgressValue />
  </Progress>
);

export default ProgressDemo;
