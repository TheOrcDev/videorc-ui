"use client";

import { useEffect, useRef, useState } from "react";

import { RecordButton } from "@/components/record-button";
import type { RecordButtonState } from "@/components/record-button";

// How long a pretend backend takes to start a recording and to finish one.
const START_TAKES_MS = 600;
const STOP_TAKES_MS = 900;

const RecordButtonDemo = () => {
  const [state, setState] = useState<RecordButtonState>("idle");
  const pending = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(pending.current), []);

  // A busy button takes no click, so only idle and running get here.
  const toggle = () => {
    const starting = state === "idle";
    setState(starting ? "starting" : "stopping");
    pending.current = setTimeout(
      () => setState(starting ? "running" : "idle"),
      starting ? START_TAKES_MS : STOP_TAKES_MS
    );
  };

  return <RecordButton onClick={toggle} size="lg" state={state} />;
};

export default RecordButtonDemo;
