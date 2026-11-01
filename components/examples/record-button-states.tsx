import { RecordButton } from "@/components/record-button";
import type { RecordButtonState } from "@/components/record-button";

const STATES: {
  caption: string;
  disabled?: boolean;
  running?: string;
  state: RecordButtonState;
}[] = [
  { caption: "Idle", state: "idle" },
  { caption: "Starting", state: "starting" },
  { caption: "Recording", state: "running" },
  { caption: "Live", running: "End livestream", state: "running" },
  { caption: "Stopping", state: "stopping" },
  { caption: "Blocked", disabled: true, state: "idle" },
];

const RecordButtonStates = () => (
  <div className="grid grid-cols-[auto_auto_auto] items-center gap-x-6 gap-y-3">
    {STATES.map(({ caption, disabled, running, state }) => (
      <div className="contents" key={caption}>
        <span className="text-meta text-muted-foreground">{caption}</span>
        <RecordButton
          disabled={disabled}
          labels={{ running }}
          size="lg"
          state={state}
        />
        <RecordButton disabled={disabled} labels={{ running }} state={state} />
      </div>
    ))}
  </div>
);

export default RecordButtonStates;
