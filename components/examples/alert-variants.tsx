"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const AlertVariants = () => (
  <div className="flex w-full max-w-md flex-col gap-2">
    <Alert>
      <AlertTitle>Recordings save to your Movies folder.</AlertTitle>
    </Alert>
    <Alert variant="quiet">
      <AlertTitle>Captions appear after the recording stops.</AlertTitle>
    </Alert>
    <Alert variant="locked">
      <AlertTitle>Locked while you’re recording or live.</AlertTitle>
      <AlertDescription>
        Changes apply the next time you record or go live.
      </AlertDescription>
    </Alert>
    <Alert variant="success">
      <AlertTitle>Recording saved</AlertTitle>
      <AlertDescription>Launch demo is in your library.</AlertDescription>
    </Alert>
    <Alert variant="warning">
      <AlertTitle>Your microphone is muted.</AlertTitle>
    </Alert>
    <Alert variant="destructive">
      <AlertTitle>Couldn’t save the recording</AlertTitle>
      <AlertDescription>
        The disk is full. Free up space, then record again.
      </AlertDescription>
    </Alert>
  </div>
);

export default AlertVariants;
