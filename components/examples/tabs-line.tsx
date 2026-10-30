"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const TabsLine = () => (
  <Tabs className="w-full max-w-sm" defaultValue="upcoming">
    <TabsList aria-label="Which streams" variant="line">
      <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
      <TabsTrigger value="past">Past</TabsTrigger>
    </TabsList>
    <TabsContent value="upcoming">
      <p className="text-muted-foreground">
        Friday Q&amp;A starts at 6:00 PM on YouTube and Twitch.
      </p>
    </TabsContent>
    <TabsContent value="past">
      <p className="text-muted-foreground">
        No past streams yet. They show up here after you go live.
      </p>
    </TabsContent>
  </Tabs>
);

export default TabsLine;
