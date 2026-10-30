"use client";

import { useState } from "react";

import { FolderIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { FieldGroup, SettingsRow } from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";

const FieldSettingsRow = () => {
  const [saveLocal, setSaveLocal] = useState(true);
  const [chatInStudio, setChatInStudio] = useState(false);
  return (
    <FieldGroup className="max-w-lg" variant="grouped">
      <SettingsRow
        aria-label="Recordings folder"
        description="~/Movies/Videorc"
        error="The recordings folder you chose isn't available."
        label="Recordings folder"
      >
        <Button variant="outline">
          <FolderIcon data-icon="inline-start" />
          Choose…
        </Button>
      </SettingsRow>
      <SettingsRow
        description="Keep a copy on this computer while you stream."
        label="Save local recording"
      >
        <Switch checked={saveLocal} onCheckedChange={setSaveLocal} />
      </SettingsRow>
      <SettingsRow
        description="Show chat under Session while you're on air."
        label="Chat in Studio"
      >
        <Switch checked={chatInStudio} onCheckedChange={setChatInStudio} />
      </SettingsRow>
    </FieldGroup>
  );
};

export default FieldSettingsRow;
