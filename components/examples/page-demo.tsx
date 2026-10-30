"use client";

import { useState } from "react";

import { CONFIG_GRID_PAIR, ConfigGrid, PageHeader } from "@/components/page";
import { Pane, PaneBody, Toolbar } from "@/components/pane";
import { PanelSection } from "@/components/panel-section";
import { Button } from "@/components/ui/button";
import { FieldGroup, SettingsRow } from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";

const PageDemo = () => {
  const [hardware, setHardware] = useState(true);
  const [lowLatency, setLowLatency] = useState(false);
  return (
    <div className="bg-glass-content rounded-panel flex h-80 w-full max-w-xl overflow-hidden border">
      <Pane>
        <Toolbar title="Output" />
        <PaneBody className="flex flex-col">
          <PageHeader
            action={<Button variant="secondary">Test recording…</Button>}
            description="Quality for recordings and livestreams on this computer."
            title="Output"
          />
          <ConfigGrid className={CONFIG_GRID_PAIR}>
            <PanelSection
              description="1080p at 60 fps, 12 Mbps."
              title="Recording"
            >
              <FieldGroup variant="grouped">
                <SettingsRow label="Hardware encoder">
                  <Switch checked={hardware} onCheckedChange={setHardware} />
                </SettingsRow>
              </FieldGroup>
            </PanelSection>
            <PanelSection
              description="720p at 30 fps, 4.5 Mbps."
              title="Livestream"
            >
              <FieldGroup variant="grouped">
                <SettingsRow label="Low latency">
                  <Switch
                    checked={lowLatency}
                    onCheckedChange={setLowLatency}
                  />
                </SettingsRow>
              </FieldGroup>
            </PanelSection>
          </ConfigGrid>
        </PaneBody>
      </Pane>
    </div>
  );
};

export default PageDemo;
