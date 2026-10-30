"use client";

import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

const AlertDemo = () => (
  <Alert className="max-w-md" variant="warning">
    <AlertTitle>Stream health is poor</AlertTitle>
    <AlertDescription>
      Viewers may see buffering. Lower the bitrate or check your upload speed.
    </AlertDescription>
    <AlertAction>
      <Button size="xs" variant="secondary">
        Open Health
      </Button>
    </AlertAction>
  </Alert>
);

export default AlertDemo;
