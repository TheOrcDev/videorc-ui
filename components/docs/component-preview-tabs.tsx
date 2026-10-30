"use client";

import type { ReactNode } from "react";

import { PreviewSurface } from "@/components/docs/preview-surface";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

interface ComponentPreviewTabsProps {
  align?: "center" | "start" | "end";
  className?: string;
  code: ReactNode;
  preview: ReactNode;
}

export const ComponentPreviewTabs = ({
  align = "center",
  className,
  code,
  preview,
}: ComponentPreviewTabsProps) => (
  <div className="not-prose my-6">
    <Tabs defaultValue="preview">
      <TabsList variant="line">
        <TabsTrigger value="preview">Preview</TabsTrigger>
        <TabsTrigger value="code">Code</TabsTrigger>
      </TabsList>
      <TabsContent value="preview">
        <PreviewSurface
          className={cn(
            "text-foreground rounded-panel flex min-h-72 w-full justify-center border p-4 sm:p-10",
            align === "center" && "items-center",
            align === "start" && "items-start",
            align === "end" && "items-end",
            className
          )}
          data-slot="component-preview"
        >
          {preview}
        </PreviewSurface>
      </TabsContent>
      <TabsContent
        className="[&_figure]:my-0 [&_pre]:max-h-[32rem]"
        value="code"
      >
        {code}
      </TabsContent>
    </Tabs>
  </div>
);
