"use client";

import { useState } from "react";

import { FolderIcon, MarkerIcon } from "@/components/icons";
import { PanelSection } from "@/components/panel-section";
import { Button } from "@/components/ui/button";
import { FieldGroup, SettingsRow } from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";

const PanelSectionDemo = () => {
  const [saveLocal, setSaveLocal] = useState(true);
  const [tracks, setTracks] = useState(false);
  const [markers, setMarkers] = useState(true);
  return (
    <div className="bg-glass-content rounded-panel w-full max-w-xl overflow-hidden border">
      <PanelSection
        action={
          <Button variant="secondary">
            <FolderIcon data-icon="inline-start" />
            Choose folder…
          </Button>
        }
        description="Recordings save to ~/Movies/Videorc."
        title="Recording"
      >
        <FieldGroup variant="grouped">
          <SettingsRow
            description="Keep a copy on this computer while you stream."
            label="Save local recording"
          >
            <Switch checked={saveLocal} onCheckedChange={setSaveLocal} />
          </SettingsRow>
          <SettingsRow
            description="One track per microphone, for editing later."
            label="Separate audio tracks"
          >
            <Switch checked={tracks} onCheckedChange={setTracks} />
          </SettingsRow>
        </FieldGroup>
      </PanelSection>
      <PanelSection
        action={
          <Switch
            aria-label="Markers"
            checked={markers}
            onCheckedChange={setMarkers}
          />
        }
        description="Press M while you record to mark a moment you want to find again."
        icon={MarkerIcon}
        title="Markers"
      />
    </div>
  );
};

export default PanelSectionDemo;
