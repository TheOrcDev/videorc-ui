"use client";

import type { ReactNode } from "react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface FlavourTabsProps {
  gpui: ReactNode;
  react: ReactNode;
}

/**
 * A component page with a GPUI twin: the React docs and the GPUI docs side
 * by side (Videorc plan 260, D3). React stays the default.
 */
export const FlavourTabs = ({ gpui, react }: FlavourTabsProps) => (
  <Tabs defaultValue="react">
    <TabsList className="not-prose mb-2" variant="line">
      <TabsTrigger value="react">React</TabsTrigger>
      <TabsTrigger value="gpui">GPUI</TabsTrigger>
    </TabsList>
    <TabsContent value="react">{react}</TabsContent>
    <TabsContent value="gpui">{gpui}</TabsContent>
  </Tabs>
);
