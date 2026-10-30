"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const TabsVertical = () => (
  <Tabs
    className="w-full max-w-md"
    defaultValue="general"
    orientation="vertical"
  >
    <TabsList aria-label="Settings">
      <TabsTrigger value="general">General</TabsTrigger>
      <TabsTrigger value="permissions">Permissions</TabsTrigger>
      <TabsTrigger value="shortcuts">Shortcuts</TabsTrigger>
    </TabsList>
    <TabsContent value="general">
      <p className="text-muted-foreground">
        Where recordings are saved, and how Videorc starts.
      </p>
    </TabsContent>
    <TabsContent value="permissions">
      <p className="text-muted-foreground">
        Camera, microphone and screen access for Videorc.
      </p>
    </TabsContent>
    <TabsContent value="shortcuts">
      <p className="text-muted-foreground">
        Every shortcut, and the keys you bound yourself.
      </p>
    </TabsContent>
  </Tabs>
);

export default TabsVertical;
