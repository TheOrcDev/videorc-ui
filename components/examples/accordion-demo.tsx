"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const AccordionDemo = () => (
  <Accordion className="max-w-md" defaultValue={["video"]}>
    <AccordionItem value="video">
      <AccordionTrigger>Video</AccordionTrigger>
      <AccordionContent>
        Record at 1080p and 60 fps. Livestreams use the quality each destination
        accepts.
      </AccordionContent>
    </AccordionItem>
    <AccordionItem value="audio">
      <AccordionTrigger>Audio</AccordionTrigger>
      <AccordionContent>
        Your microphone and system audio are mixed into one track, with noise
        cleanup on.
      </AccordionContent>
    </AccordionItem>
    <AccordionItem value="output">
      <AccordionTrigger>Output</AccordionTrigger>
      <AccordionContent>
        Recordings save as MP4 to your Movies folder.
      </AccordionContent>
    </AccordionItem>
  </Accordion>
);

export default AccordionDemo;
