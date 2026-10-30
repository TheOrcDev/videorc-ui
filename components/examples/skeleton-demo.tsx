"use client";

import { Skeleton } from "@/components/ui/skeleton";

const SkeletonDemo = () => (
  <div className="flex items-center gap-3">
    <Skeleton className="aspect-video w-32" />
    <div className="flex flex-col gap-2">
      <Skeleton className="h-4 w-44" />
      <Skeleton className="h-3 w-24" />
    </div>
  </div>
);

export default SkeletonDemo;
