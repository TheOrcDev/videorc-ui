"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const TabsDemo = () => (
  <Tabs className="w-full max-w-sm" defaultValue="chat">
    <TabsList aria-label="Stream Manager panes">
      <TabsTrigger value="chat">Chat</TabsTrigger>
      <TabsTrigger value="activity">Activity</TabsTrigger>
      <TabsTrigger value="buddy">Buddy</TabsTrigger>
    </TabsList>
    <TabsContent value="chat">
      <p className="text-muted-foreground">
        Chat from YouTube and Twitch shows up here while you’re live.
      </p>
    </TabsContent>
    <TabsContent value="activity">
      <p className="text-muted-foreground">
        Follows, subscriptions and raids, newest first.
      </p>
    </TabsContent>
    <TabsContent value="buddy">
      <p className="text-muted-foreground">
        Buddy keeps the questions it heard in chat until you answer them.
      </p>
    </TabsContent>
  </Tabs>
);

export default TabsDemo;
