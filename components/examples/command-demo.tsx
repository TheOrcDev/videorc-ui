"use client";

import {
  LibraryIcon,
  LivestreamIcon,
  MicrophoneIcon,
  RecordIcon,
  SourcesIcon,
  StudioIcon,
} from "@/components/icons";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { ShortcutKeys } from "@/components/ui/shortcut-keys";

const CommandDemo = () => (
  // Inline, Command needs a surface: it paints none of its own.
  <div className="glass-float-dialog rounded-panel w-full max-w-lg overflow-hidden border">
    <Command>
      <CommandInput placeholder="Search commands…" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Session">
          <CommandItem keywords={["record"]}>
            <RecordIcon />
            Start recording
            <CommandShortcut>
              <ShortcutKeys accelerator="CmdOrCtrl+Shift+R" />
            </CommandShortcut>
          </CommandItem>
          <CommandItem keywords={["stream", "livestream", "broadcast"]}>
            <LivestreamIcon />
            Go Live…
          </CommandItem>
          <CommandItem keywords={["mic", "audio", "mute"]}>
            <MicrophoneIcon />
            Mute microphone
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Pages">
          <CommandItem>
            <StudioIcon />
            Studio
            <CommandShortcut>
              <ShortcutKeys accelerator="CmdOrCtrl+1" />
            </CommandShortcut>
          </CommandItem>
          <CommandItem>
            <SourcesIcon />
            Sources
            <CommandShortcut>
              <ShortcutKeys accelerator="CmdOrCtrl+2" />
            </CommandShortcut>
          </CommandItem>
          <CommandItem>
            <LibraryIcon />
            Library
            <CommandShortcut>
              <ShortcutKeys accelerator="CmdOrCtrl+8" />
            </CommandShortcut>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  </div>
);

export default CommandDemo;
