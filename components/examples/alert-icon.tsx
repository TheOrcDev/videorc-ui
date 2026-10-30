"use client";

import { MicrophoneIcon } from "@/components/icons";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const AlertIcon = () => (
  <div className="flex w-full max-w-md flex-col gap-2">
    <Alert icon={MicrophoneIcon} variant="warning">
      <AlertTitle>No microphone found</AlertTitle>
      <AlertDescription>
        Connect a microphone, or choose one in Sources.
      </AlertDescription>
    </Alert>
    <Alert icon={null} variant="quiet">
      <AlertTitle>Twitch shows your stream title above the chat.</AlertTitle>
    </Alert>
  </div>
);

export default AlertIcon;
