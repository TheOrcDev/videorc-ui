"use client";

import { Button } from "@/components/ui/button";

const ButtonVariants = () => (
  <div className="flex flex-wrap items-center gap-2">
    <Button>Default</Button>
    <Button variant="secondary">Secondary</Button>
    <Button variant="outline">Outline</Button>
    <Button variant="ghost">Ghost</Button>
    <Button variant="destructive">Delete</Button>
    <Button variant="link">Link</Button>
    <Button variant="solid">Solid</Button>
    <Button variant="chromatic">Chromatic</Button>
  </div>
);

export default ButtonVariants;
