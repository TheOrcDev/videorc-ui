"use client";

import { useState } from "react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const DESTINATIONS = [
  {
    details: "Public, not made for kids. Title: Launch day.",
    label: "YouTube",
    value: "youtube",
  },
  {
    details: "Category: Science & Technology. Title: Launch day.",
    label: "Twitch",
    value: "twitch",
  },
  {
    details: "Posts the stream link when you go live.",
    label: "X",
    value: "x",
  },
];

const AccordionMultiple = () => {
  const [open, setOpen] = useState<string[]>(["youtube", "twitch"]);
  return (
    <Accordion
      aria-label="Details for each destination"
      className="max-w-md"
      multiple
      onValueChange={setOpen}
      value={open}
    >
      {DESTINATIONS.map((destination) => (
        <AccordionItem key={destination.value} value={destination.value}>
          <AccordionTrigger>{destination.label}</AccordionTrigger>
          <AccordionContent>{destination.details}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
};

export default AccordionMultiple;
