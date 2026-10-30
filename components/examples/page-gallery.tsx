"use client";

import { useState } from "react";

import { Gallery } from "@/components/page";

const BACKGROUNDS = [
  "Studio wall",
  "Night city",
  "Bookshelf",
  "Gradient",
  "Forest",
  "Plain dark",
] as const;

const PageGallery = () => {
  const [chosen, setChosen] = useState<string>("Night city");
  return (
    <Gallery aria-label="Backgrounds" className="w-full max-w-xl" dense>
      {BACKGROUNDS.map((name) => (
        <button
          aria-pressed={chosen === name}
          className="rounded-row bg-foreground/4 aria-pressed:border-foreground/40 focus-visible:ring-ring flex flex-col overflow-hidden border text-left outline-none focus-visible:ring-2"
          key={name}
          onClick={() => setChosen(name)}
          type="button"
        >
          <span aria-hidden className="bg-video-ground aspect-video w-full" />
          <span className="text-meta truncate px-2 py-1.5">{name}</span>
        </button>
      ))}
    </Gallery>
  );
};

export default PageGallery;
