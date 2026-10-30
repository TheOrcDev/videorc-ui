"use client";

import { CameraIcon, DisplayIcon, MicrophoneIcon } from "@/components/icons";
import { GroupedList, ListRow } from "@/components/list-row";
import { PageStack } from "@/components/page";
import { Pane, PaneBody, Toolbar } from "@/components/pane";
import { PanelSection } from "@/components/panel-section";
import { Button } from "@/components/ui/button";

const PaneDemo = () => (
  <div className="bg-glass-content rounded-panel flex h-80 w-full max-w-xl overflow-hidden border">
    <Pane>
      <Toolbar title="Sources" />
      <PaneBody>
        <PageStack>
          <PanelSection
            action={<Button variant="secondary">Add source…</Button>}
            description="What the Studio can capture."
            title="Video"
          >
            <GroupedList aria-label="Video sources">
              <ListRow
                context="Built-in"
                icon={<CameraIcon />}
                meta="In use"
                title="FaceTime HD Camera"
              />
              <ListRow
                context="Display 1"
                icon={<DisplayIcon />}
                meta="1920 × 1080"
                title="Screen"
              />
            </GroupedList>
          </PanelSection>
          <PanelSection description="Mixed into every scene." title="Audio">
            <GroupedList aria-label="Audio sources">
              <ListRow
                context="USB"
                icon={<MicrophoneIcon />}
                meta="In use"
                title="Shure MV7"
              />
              <ListRow
                context="Built-in"
                icon={<MicrophoneIcon />}
                meta="Off"
                title="MacBook Pro Microphone"
              />
            </GroupedList>
          </PanelSection>
        </PageStack>
      </PaneBody>
    </Pane>
  </div>
);

export default PaneDemo;
