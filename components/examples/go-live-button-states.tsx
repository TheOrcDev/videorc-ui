import { GoLiveButton } from "@/components/go-live-button";
import type { GoLiveButtonState } from "@/components/go-live-button";

const STATES: {
  caption: string;
  disabled?: boolean;
  state: GoLiveButtonState;
}[] = [
  { caption: "Idle", state: "idle" },
  { caption: "Checking", state: "checking" },
  { caption: "Live", state: "live" },
  { caption: "Stopping", state: "stopping" },
  { caption: "Blocked", disabled: true, state: "idle" },
];

const GoLiveButtonStates = () => (
  <div className="grid grid-cols-[auto_auto_auto] items-center gap-x-6 gap-y-3">
    {STATES.map(({ caption, disabled, state }) => (
      <div className="contents" key={caption}>
        <span className="text-meta text-muted-foreground">{caption}</span>
        <GoLiveButton disabled={disabled} size="lg" state={state} />
        <GoLiveButton disabled={disabled} state={state} />
      </div>
    ))}
  </div>
);

export default GoLiveButtonStates;
