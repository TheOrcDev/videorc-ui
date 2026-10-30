"use client";

import { ScrollArea } from "@/components/ui/scroll-area";

const RECORDINGS = [
  { duration: "1:02:14", id: "r1", title: "Launch demo" },
  { duration: "48:30", id: "r2", title: "Weekly stream" },
  { duration: "12:05", id: "r3", title: "Podcast intro" },
  { duration: "2:31:40", id: "r4", title: "Speedrun practice" },
  { duration: "35:12", id: "r5", title: "Q&A with viewers" },
  { duration: "9:48", id: "r6", title: "Camera test" },
  { duration: "1:15:00", id: "r7", title: "Studio tour" },
  { duration: "22:19", id: "r8", title: "Sound check" },
  { duration: "54:03", id: "r9", title: "Charity stream" },
  { duration: "6:27", id: "r10", title: "Teaser clip" },
  { duration: "41:56", id: "r11", title: "Patch notes" },
  { duration: "18:44", id: "r12", title: "Interview" },
];

const ScrollAreaDemo = () => (
  <div className="rounded-row h-60 w-64 border">
    <ScrollArea className="h-full">
      <ul aria-label="Recordings" className="flex flex-col p-1">
        {RECORDINGS.map((recording) => (
          <li
            className="rounded-chip hover:bg-accent flex h-8 items-center justify-between gap-3 px-2 text-sm"
            key={recording.id}
          >
            <span className="truncate">{recording.title}</span>
            <span className="text-muted-foreground text-meta tabular-nums">
              {recording.duration}
            </span>
          </li>
        ))}
      </ul>
    </ScrollArea>
  </div>
);

export default ScrollAreaDemo;
