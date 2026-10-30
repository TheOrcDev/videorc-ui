"use client";

import { LockAlert } from "@/components/lock-alert";
import { SettingsRow } from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";

const PREMIUM_URL = "https://www.videorc.com/premium";

const signIn = () => {
  // A demo: your app starts its sign-in here.
};

const LockAlertDemo = () => (
  <div className="flex w-full max-w-md flex-col gap-3">
    <LockAlert
      action={{ kind: "view-premium", url: PREMIUM_URL }}
      reason="Live captions are part of Videorc Premium."
    />
    {/* The feature stays on screen behind the lock, disabled. */}
    <SettingsRow className="mx-3 w-auto" label="Show captions on stream">
      <Switch disabled />
    </SettingsRow>
    <LockAlert
      action={{ kind: "sign-in", onClick: signIn }}
      reason="Sign in to use Buddy."
    />
  </div>
);

export default LockAlertDemo;
