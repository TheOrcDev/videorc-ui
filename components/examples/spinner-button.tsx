"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

const SAVE_MS = 1500;

const SpinnerButton = () => {
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!saving) {
      return;
    }
    const timer = setTimeout(() => setSaving(false), SAVE_MS);
    return () => clearTimeout(timer);
  }, [saving]);

  return (
    <Button disabled={saving} onClick={() => setSaving(true)}>
      {saving ? <Spinner aria-hidden data-icon="inline-start" /> : null}
      {saving ? "Saving…" : "Save recording"}
    </Button>
  );
};

export default SpinnerButton;
