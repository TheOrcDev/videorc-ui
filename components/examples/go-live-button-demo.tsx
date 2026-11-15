"use client";

import { useEffect, useRef, useState } from "react";

import { GoLiveButton } from "@/components/go-live-button";
import type { GoLiveButtonState } from "@/components/go-live-button";

// How long pretend destinations take to answer, and a livestream to end.
const CHECK_TAKES_MS = 900;
const STOP_TAKES_MS = 900;

const GoLiveButtonDemo = () => {
  const [state, setState] = useState<GoLiveButtonState>("idle");
  const pending = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(pending.current), []);

  // A busy button takes no click, so only idle and live get here.
  const toggle = () => {
    const starting = state === "idle";
    setState(starting ? "checking" : "stopping");
    pending.current = setTimeout(
      () => setState(starting ? "live" : "idle"),
      starting ? CHECK_TAKES_MS : STOP_TAKES_MS
    );
  };

  return <GoLiveButton onClick={toggle} size="lg" state={state} />;
};

export default GoLiveButtonDemo;
