"use client";

import { Spinner } from "@/components/ui/spinner";

const SpinnerDemo = () => (
  <div className="flex items-center gap-4">
    <Spinner aria-label="Loading scenes" />
    <Spinner aria-label="Loading sources" className="size-6" />
  </div>
);

export default SpinnerDemo;
