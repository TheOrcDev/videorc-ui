"use client";

import { useState } from "react";

import { LivestreamIcon, VideoFileIcon } from "@/components/icons";
import { GroupedList, ListRow } from "@/components/list-row";
import {
  PANE_OWNS_SCROLL,
  Pane,
  PaneBody,
  PaneStrip,
  Toolbar,
} from "@/components/pane";
import { SegmentedControl } from "@/components/ui/segmented-control";

type Kind = "all" | "recording" | "livestream";

const KINDS = [
  { label: "All", value: "all" },
  { label: "Recordings", value: "recording" },
  { label: "Livestreams", value: "livestream" },
] as const;

const SESSIONS = [
  { date: "Today", kind: "livestream", length: "1:12:40", title: "Friday Q&A" },
  { date: "Today", kind: "recording", length: "08:14", title: "Intro take 3" },
  {
    date: "Yesterday",
    kind: "recording",
    length: "21:05",
    title: "Tutorial: scenes",
  },
  {
    date: "Monday",
    kind: "livestream",
    length: "2:03:11",
    title: "Speedrun night",
  },
  {
    date: "Monday",
    kind: "recording",
    length: "04:52",
    title: "Thumbnail clips",
  },
  {
    date: "Oct 24",
    kind: "livestream",
    length: "58:30",
    title: "Community hangout",
  },
] as const;

const PaneStripExample = () => {
  const [kind, setKind] = useState<Kind>("all");
  const shown = SESSIONS.filter(
    (session) => kind === "all" || session.kind === kind
  );
  return (
    <div className="bg-glass-content rounded-panel flex h-80 w-full max-w-xl overflow-hidden border">
      <Pane>
        <Toolbar title="Library" />
        <PaneBody>
          {/* The page owns its scroll: the strip stays, the list scrolls. */}
          <div {...PANE_OWNS_SCROLL} className="flex min-h-0 flex-1 flex-col">
            <PaneStrip>
              <SegmentedControl
                aria-label="Show"
                onValueChange={setKind}
                options={KINDS}
                size="sm"
                value={kind}
              />
            </PaneStrip>
            <div className="p-gutter min-h-0 flex-1 overflow-y-auto overscroll-contain">
              <GroupedList aria-label="Sessions">
                {shown.map((session) => (
                  <ListRow
                    as="button"
                    context={session.date}
                    icon={
                      session.kind === "livestream" ? (
                        <LivestreamIcon />
                      ) : (
                        <VideoFileIcon />
                      )
                    }
                    key={session.title}
                    meta={session.length}
                    title={session.title}
                  />
                ))}
              </GroupedList>
            </div>
          </div>
        </PaneBody>
      </Pane>
    </div>
  );
};

export default PaneStripExample;
