"use client";

import { useState } from "react";

import { CameraIcon } from "@/components/icons";
import { PanelSection } from "@/components/panel-section";
import { Field, FieldLabel } from "@/components/ui/field";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { Switch } from "@/components/ui/switch";

type Fit = "fill" | "fit";

const FITS = [
  { label: "Fill", value: "fill" },
  { label: "Fit", value: "fit" },
] as const;

const PanelSectionNested = () => {
  const [visible, setVisible] = useState(true);
  const [fit, setFit] = useState<Fit>("fill");
  return (
    <div className="bg-glass-content rounded-panel w-full max-w-sm overflow-hidden border">
      <PanelSection
        action={
          <Switch
            aria-label="Show camera"
            checked={visible}
            onCheckedChange={setVisible}
          />
        }
        description="FaceTime HD Camera"
        icon={CameraIcon}
        title="Camera"
      />
      <PanelSection
        description="Drag the camera on the stage, or nudge it with the arrow keys."
        headingLevel={3}
        title="Placement"
      />
      <PanelSection headingLevel={3} title="Lens">
        <Field>
          <FieldLabel>Fit</FieldLabel>
          <SegmentedControl onValueChange={setFit} options={FITS} value={fit} />
        </Field>
      </PanelSection>
    </div>
  );
};

export default PanelSectionNested;
