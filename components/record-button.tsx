import type { ComponentProps, ReactElement } from "react";

import { RecordIcon, StopIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";

/**
 * Where the session stands. `running` is a recording or a livestream; the
 * words say which.
 */
type RecordButtonState = "idle" | "starting" | "running" | "stopping";

/** Each state's words when the caller passes none. */
const RECORD_BUTTON_LABELS: Record<RecordButtonState, string> = {
  idle: "Record",
  running: "Stop recording",
  starting: "Record",
  stopping: "Stopping…",
};

type RecordButtonProps = Omit<
  ComponentProps<typeof Button>,
  "focusableWhenDisabled" | "variant"
> & {
  state?: RecordButtonState;
};

/**
 * Record and its stop button, as one control: the record LED, switched off
 * at idle and lit from the click. While the session runs, its bloom
 * breathes and the button stops the session. Starting and stopping answer
 * at once: the lens stays lit, the button takes no click and keeps its
 * focus, and nothing dims, because the LED is the feedback.
 *
 * It's a one-shot action whose words change, so it takes no `aria-pressed`.
 * Announce the session's state in a status region, not here. Pass
 * `disabled` with a Disabled reason when a start is blocked.
 */
function RecordButton({
  state = "idle",
  children = RECORD_BUTTON_LABELS[state],
  disabled = false,
  ...props
}: RecordButtonProps): ReactElement {
  const busy = state === "starting" || state === "stopping";
  const Glyph =
    state === "idle" || state === "starting" ? RecordIcon : StopIcon;
  return (
    <Button
      {...props}
      data-lit={state === "idle" ? undefined : ""}
      data-state={state}
      disabled={busy || disabled}
      focusableWhenDisabled={busy}
      variant="record"
    >
      <Glyph data-icon="inline-start" weight="fill" />
      {children}
    </Button>
  );
}

export {
  RecordButton,
  RECORD_BUTTON_LABELS,
  type RecordButtonProps,
  type RecordButtonState,
};
