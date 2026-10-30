"use client";

import { ScrollArea } from "@/components/ui/scroll-area";

const MESSAGES = [
  { author: "maya_streams", id: "m1", text: "Hi from Lisbon!" },
  { author: "jonas", id: "m2", text: "The new overlay looks great." },
  { author: "priya.dev", id: "m3", text: "Is the audio a bit quiet?" },
  { author: "maya_streams", id: "m4", text: "Sounds fine here." },
  { author: "nightowl", id: "m5", text: "What camera is that?" },
  { author: "jonas", id: "m6", text: "Can you show the scene setup again?" },
  { author: "priya.dev", id: "m7", text: "Fixed now, thanks!" },
  { author: "nightowl", id: "m8", text: "First time here, hello." },
  { author: "kai", id: "m9", text: "Clip that!" },
  { author: "maya_streams", id: "m10", text: "See you next week." },
];

const ScrollAreaChat = () => (
  <div className="rounded-row w-72 border">
    <ScrollArea type="hover" viewportClassName="max-h-56">
      <ol aria-label="Chat messages" className="flex flex-col gap-2 p-3">
        {MESSAGES.map((message) => (
          <li className="text-sm" key={message.id}>
            <span className="text-muted-foreground font-medium">
              {message.author}
            </span>{" "}
            {message.text}
          </li>
        ))}
      </ol>
    </ScrollArea>
  </div>
);

export default ScrollAreaChat;
