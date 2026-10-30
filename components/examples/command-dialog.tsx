"use client";

import { useEffect, useState } from "react";

import {
  OutputIcon,
  SceneIcon,
  SearchIcon,
  SettingsIcon,
  StudioIcon,
} from "@/components/icons";
import { Button } from "@/components/ui/button";
import {
  CommandDialog,
  CommandEmpty,
  CommandFooter,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { ShortcutKeys } from "@/components/ui/shortcut-keys";

const PAGES = [
  { icon: StudioIcon, label: "Studio" },
  { icon: SceneIcon, label: "Scene" },
  { icon: OutputIcon, label: "Output" },
  { icon: SettingsIcon, label: "Settings" },
] as const;

const CommandDialogExample = () => {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState("Open Studio");

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen((value) => !value);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <>
      <Button onClick={() => setOpen(true)} variant="secondary">
        <SearchIcon data-icon="inline-start" />
        Search
        <ShortcutKeys accelerator="CmdOrCtrl+K" />
      </Button>
      <CommandDialog
        onOpenChange={setOpen}
        onValueChange={setSelected}
        open={open}
        value={selected}
      >
        <CommandInput placeholder="Search commands…" />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Pages">
            {PAGES.map(({ icon: Icon, label }) => (
              <CommandItem
                key={label}
                onSelect={() => setOpen(false)}
                value={`Open ${label}`}
              >
                <Icon />
                {label}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
        <CommandFooter>
          <span>{selected}</span>
          <ShortcutKeys accelerator="Enter" />
        </CommandFooter>
      </CommandDialog>
    </>
  );
};

export default CommandDialogExample;
