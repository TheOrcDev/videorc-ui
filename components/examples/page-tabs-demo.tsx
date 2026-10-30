"use client";

import { useState } from "react";

import { PageStack } from "@/components/page";
import { PageTabs } from "@/components/page-tabs";
import { Pane, PaneBody, Toolbar } from "@/components/pane";
import { PanelSection } from "@/components/panel-section";
import { FieldGroup, SettingsRow } from "@/components/ui/field";
import { ShortcutKeys } from "@/components/ui/shortcut-keys";
import { Switch } from "@/components/ui/switch";
import { TabsContent } from "@/components/ui/tabs";

type Tab = "general" | "recording" | "shortcuts";

const TABS = [
  { id: "general", label: "General" },
  { id: "recording", label: "Recording" },
  { id: "shortcuts", label: "Shortcuts" },
] as const;

const SHORTCUTS = [
  { accelerator: "CmdOrCtrl+K", name: "Search" },
  { accelerator: "CmdOrCtrl+P", name: "Open Preview" },
  { accelerator: "CmdOrCtrl+Shift+N", name: "Open Notes" },
  { accelerator: "CmdOrCtrl+Shift+J", name: "Open Stream Manager" },
] as const;

const PageTabsDemo = () => {
  const [tab, setTab] = useState<Tab>("general");
  const [launch, setLaunch] = useState(false);
  const [updates, setUpdates] = useState(true);
  const [saveLocal, setSaveLocal] = useState(true);
  return (
    <div className="bg-glass-content rounded-panel flex h-80 w-full max-w-xl overflow-hidden border">
      <Pane>
        <Toolbar title="Settings" />
        <PaneBody>
          <PageTabs<Tab>
            label="Settings sections"
            onValueChange={setTab}
            tabs={TABS}
            value={tab}
          >
            <TabsContent value="general">
              <PageStack>
                <PanelSection
                  description="How Videorc starts and stays current."
                  title="App"
                >
                  <FieldGroup variant="grouped">
                    <SettingsRow label="Open at login">
                      <Switch checked={launch} onCheckedChange={setLaunch} />
                    </SettingsRow>
                    <SettingsRow
                      description="Updates install the next time you quit."
                      label="Download updates"
                    >
                      <Switch checked={updates} onCheckedChange={setUpdates} />
                    </SettingsRow>
                  </FieldGroup>
                </PanelSection>
              </PageStack>
            </TabsContent>
            <TabsContent value="recording">
              <PageStack>
                <PanelSection
                  description="Recordings save to ~/Movies/Videorc."
                  title="Recording"
                >
                  <FieldGroup variant="grouped">
                    <SettingsRow
                      description="Keep a copy on this computer while you stream."
                      label="Save local recording"
                    >
                      <Switch
                        checked={saveLocal}
                        onCheckedChange={setSaveLocal}
                      />
                    </SettingsRow>
                  </FieldGroup>
                </PanelSection>
              </PageStack>
            </TabsContent>
            <TabsContent value="shortcuts">
              <PageStack>
                <PanelSection
                  description="They work while any Videorc window is in front."
                  title="Windows"
                >
                  <dl className="flex flex-col gap-2 text-sm">
                    {SHORTCUTS.map(({ accelerator, name }) => (
                      <div
                        className="flex items-center justify-between"
                        key={name}
                      >
                        <dt className="text-muted-foreground">{name}</dt>
                        <dd>
                          <ShortcutKeys accelerator={accelerator} />
                        </dd>
                      </div>
                    ))}
                  </dl>
                </PanelSection>
              </PageStack>
            </TabsContent>
          </PageTabs>
        </PaneBody>
      </Pane>
    </div>
  );
};

export default PageTabsDemo;
