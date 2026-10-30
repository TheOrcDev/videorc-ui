"use client";

import { useState } from "react";

import { ConfirmDialog } from "@/components/confirm-dialog";
import {
  DeleteIcon,
  EditIcon,
  FolderIcon,
  VideoFileIcon,
} from "@/components/icons";
import { KebabMenu } from "@/components/kebab-menu";

const RECORDINGS = [
  { id: "launch", length: "41:10", name: "Launch demo" },
  { id: "qa", length: "1:02:45", name: "Friday Q&A" },
  { id: "walkthrough", length: "12:31", name: "Studio walkthrough" },
];

const noop = () => {
  // A demo: Rename and Show in Finder do nothing.
};

const KebabMenuDemo = () => {
  const [recordings, setRecordings] = useState(RECORDINGS);
  const [pending, setPending] = useState<string | null>(null);
  const target = recordings.find((recording) => recording.id === pending);

  return (
    <div className="w-full max-w-sm">
      <ul className="divide-border rounded-row flex flex-col divide-y border">
        {recordings.map((recording) => (
          <li
            className="group/kebab-host h-row flex items-center gap-2 pr-1 pl-3"
            key={recording.id}
          >
            <VideoFileIcon
              aria-hidden
              className="text-muted-foreground size-4 shrink-0"
            />
            <span className="min-w-0 flex-1 truncate text-sm">
              {recording.name}
            </span>
            <span className="text-muted-foreground text-meta tabular-nums">
              {recording.length}
            </span>
            <KebabMenu
              items={[
                {
                  icon: EditIcon,
                  id: "rename",
                  label: "Rename…",
                  onSelect: noop,
                },
                {
                  icon: FolderIcon,
                  id: "reveal",
                  label: "Show in Finder",
                  onSelect: noop,
                },
                {
                  destructive: true,
                  icon: DeleteIcon,
                  id: "delete",
                  label: "Delete…",
                  onSelect: () => setPending(recording.id),
                },
              ]}
              label={`Actions for ${recording.name}`}
              reveal="hover"
            />
          </li>
        ))}
      </ul>
      <ConfirmDialog
        confirmLabel="Delete recording"
        description={`“${target?.name ?? ""}” and its markers move to the Trash.`}
        onCancel={() => setPending(null)}
        onConfirm={() => {
          setRecordings((current) =>
            current.filter((recording) => recording.id !== pending)
          );
          setPending(null);
        }}
        open={target !== undefined}
        title="Delete recording?"
      />
    </div>
  );
};

export default KebabMenuDemo;
