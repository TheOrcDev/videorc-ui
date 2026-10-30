"use client";

import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";

import { Button } from "@/components/ui/button";

const THEMES = [
  { label: "Dark", swatch: "bg-[oklch(0.13_0_0)]", value: "dark" },
  { label: "Light", swatch: "bg-[oklch(0.985_0_0)]", value: "light" },
] as const;

const subscribeNever = () => () => {
  // The mounted flag never changes after hydration.
};

/** Videorc has one palette in two columns: flip the whole showcase between them. */
export const ThemeSwatches = () => {
  const { resolvedTheme, setTheme } = useTheme();
  // The server can't know the theme; mark neither pressed until hydrated.
  const mounted = useSyncExternalStore(
    subscribeNever,
    () => true,
    () => false
  );

  return (
    <fieldset className="flex flex-wrap items-center gap-1">
      <legend className="sr-only">Theme</legend>
      {THEMES.map((option) => {
        const pressed = mounted && resolvedTheme === option.value;
        return (
          <Button
            aria-pressed={pressed}
            key={option.value}
            onClick={() => setTheme(option.value)}
            size="xs"
            variant={pressed ? "secondary" : "ghost"}
          >
            <span
              aria-hidden
              className={`ring-foreground/20 size-2.5 rounded-full ring-1 ${option.swatch}`}
            />
            {option.label}
          </Button>
        );
      })}
    </fieldset>
  );
};
