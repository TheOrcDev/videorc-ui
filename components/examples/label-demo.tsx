"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

const LabelDemo = () => (
  <div className="flex items-center gap-2">
    <Checkbox id="label-demo-markers" />
    <Label htmlFor="label-demo-markers">Include markers in the export</Label>
  </div>
);

export default LabelDemo;
