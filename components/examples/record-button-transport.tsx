"use client";

import { useEffect, useRef, useState } from "react";

import { GoLiveButton } from "@/components/go-live-button";
import { RecordButton } from "@/components/record-button";
import type { RecordButtonState } from "@/components/record-button";
import { ShortcutKeys } from "@/components/ui/shortcut-keys";

// How long a pretend backend takes to start a session and to finish one.
const START_TAKES_MS = 600;
const STOP_TAKES_MS = 900;

/**
 * The Studio's transport: Record beside copper Go Live, then one stop
 * button. The same RecordButton stays mounted from Record to Stop, so
 * keyboard focus stays on it through the whole session.
 */
const RecordButtonTransport = () => {
  const [state, setState] = useState<RecordButtonState>("idle");
  const [live, setLive] = useState(false);
  const pending = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(pending.current), []);

  const settle = (next: RecordButtonState, ms: number) => {
    pending.current = setTimeout(() => setState(next), ms);
  };
  const start = (livestream: boolean) => {
    setLive(livestream);
    setState("starting");
    settle("running", START_TAKES_MS);
  };
  const stop = () => {
    setState("stopping");
    settle("idle", STOP_TAKES_MS);
  };

  const idle = state === "idle";
  // While Go Live runs its checks, Record is off, as in Videorc: only the
  // button that was clicked answers.
  const checking = state === "starting" && live;
  const session = state === "running" || state === "stopping";
  // Record shows its key, and a livestream ends in its own words. The
  // button keeps one width through them all.
  const labels = {
    idle: (
      <>
        Record
        <ShortcutKeys accelerator="Space" className="ml-0.5" />
      </>
    ),
    running: live ? "End livestream" : undefined,
  };
  // Go Live says "Checking…" from its click, as in Videorc. While a session
  // runs, the one stop button takes the row.
  const goLive = session ? null : (
    <GoLiveButton
      className="flex-1"
      disabled={!(idle || checking)}
      onClick={() => start(true)}
      size="lg"
      state={checking ? "checking" : "idle"}
    />
  );
  return (
    <div className="flex w-80 gap-2">
      <RecordButton
        className="flex-1"
        disabled={checking}
        labels={labels}
        onClick={idle ? () => start(false) : stop}
        size="lg"
        state={checking ? "idle" : state}
      />
      {goLive}
    </div>
  );
};

export default RecordButtonTransport;
