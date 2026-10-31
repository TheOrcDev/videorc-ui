import { RecordButton } from "@/components/record-button";
import type { RecordButtonState } from "@/components/record-button";

const STATES: {
  caption: string;
  disabled?: boolean;
  label?: string;
  state: RecordButtonState;
}[] = [
  { caption: "Idle", state: "idle" },
  { caption: "Starting", state: "starting" },
  { caption: "Recording", state: "running" },
  { caption: "Live", label: "End livestream", state: "running" },
  { caption: "Stopping", state: "stopping" },
  { caption: "Blocked", disabled: true, state: "idle" },
];

const RecordButtonStates = () => (
  <div className="grid grid-cols-[auto_auto_auto] items-center gap-x-6 gap-y-3">
    {STATES.map(({ caption, disabled, label, state }) => (
      <div className="contents" key={caption}>
        <span className="text-meta text-muted-foreground">{caption}</span>
        <RecordButton disabled={disabled} size="lg" state={state}>
          {label}
        </RecordButton>
        <RecordButton disabled={disabled} state={state}>
          {label}
        </RecordButton>
      </div>
    ))}
  </div>
);

export default RecordButtonStates;
