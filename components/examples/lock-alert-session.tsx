"use client";

import { OfflineAlert, SessionLockAlert } from "@/components/lock-alert";

const LockAlertSession = () => (
  <div className="flex w-full max-w-md flex-col gap-3">
    <SessionLockAlert />
    <SessionLockAlert locks="Destinations and stream details" />
    <OfflineAlert />
  </div>
);

export default LockAlertSession;
