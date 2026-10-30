"use client";

import { useState } from "react";

import { ErrorBoundary, errorDetails } from "@/components/error-boundary";
import type { CaughtError } from "@/components/error-boundary";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";

type CopyState = "idle" | "copied" | "failed";

const COPY_LABEL: Record<CopyState, string> = {
  copied: "Copied",
  failed: "Couldn't copy",
  idle: "Copy details",
};

// Quiet on success ("Copied" on the control), loud on failure.
const CopyDetailsButton = ({ details }: { details: string }) => {
  const [state, setState] = useState<CopyState>("idle");
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(details);
      setState("copied");
    } catch {
      setState("failed");
    }
  };
  return (
    <Button onClick={copy} variant="ghost">
      {COPY_LABEL[state]}
    </Button>
  );
};

const PaneErrorPanel = ({
  caught,
  onReset,
}: {
  caught: CaughtError;
  onReset: () => void;
}) => (
  <Empty className="flex-1" role="alert">
    <EmptyHeader>
      <EmptyTitle>This pane hit a problem</EmptyTitle>
      <EmptyDescription>Other panes still work.</EmptyDescription>
    </EmptyHeader>
    <EmptyContent>
      <div className="flex gap-2">
        <Button onClick={onReset}>Reload pane</Button>
        <CopyDetailsButton
          details={errorDetails(caught.error, caught.componentStack)}
        />
      </div>
    </EmptyContent>
  </Empty>
);

const renderPaneError = (caught: CaughtError, reset: () => void) => (
  <PaneErrorPanel caught={caught} onReset={reset} />
);

const ScenePreview = ({ broken }: { broken: boolean }) => {
  if (broken) {
    throw new Error("The Gameplay scene lost its screen source.");
  }
  return (
    <div className="bg-video-ground text-video-ground-muted grid flex-1 place-items-center text-xs">
      Gameplay
    </div>
  );
};

const ErrorBoundaryDemo = () => {
  const [broken, setBroken] = useState(false);
  return (
    <div className="flex w-full max-w-md flex-col items-start gap-3">
      <div className="bg-glass-content rounded-panel flex h-56 w-full overflow-hidden border">
        <ErrorBoundary
          fallback={renderPaneError}
          // The crash happens once, so Reload pane renders the scene again.
          onError={() => setBroken(false)}
        >
          <ScenePreview broken={broken} />
        </ErrorBoundary>
      </div>
      <Button onClick={() => setBroken(true)} variant="secondary">
        Simulate a crash
      </Button>
    </div>
  );
};

export default ErrorBoundaryDemo;
