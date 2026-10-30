"use client";

import { useState } from "react";

import { ActivityFeed } from "@/components/blocks/stream-manager/activity-feed";
import type { ActivityItem } from "@/components/blocks/stream-manager/activity-feed";
import { StatusDot } from "@/components/status-dot";
import { Badge } from "@/components/ui/badge";
import { Empty, EmptyDescription, EmptyHeader } from "@/components/ui/empty";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const ITEMS: ActivityItem[] = [
  {
    highlight: { phase: "live" },
    id: "a1",
    kind: "super-chat",
    line: "Sent a $20.00 Super Chat",
    message: "Bought my first capture card because of this channel!",
    messageId: "m-super",
    name: "Maya Chen",
    platform: "youtube",
    short: "Super Chat · $20.00",
    time: "now",
  },
  {
    id: "a2",
    kind: "subscription",
    line: "Resubscribed for 14 months at Tier 1",
    message: "Fourteen months of two-camera streams.",
    name: "nightowl_jonas",
    platform: "twitch",
    short: "Resub · 14 months",
    time: "1m",
  },
  {
    gift: true,
    id: "a3",
    kind: "subscription",
    line: "Gifted 5 Tier 1 subs to the community",
    name: "kai.streams",
    platform: "twitch",
    short: "Gifted 5 subs",
    time: "3m",
  },
  {
    id: "a4",
    kind: "raid",
    line: "Raided with 42 viewers",
    name: "pixelpilot",
    platform: "twitch",
    short: "Raid · 42 viewers",
    time: "6m",
  },
  {
    id: "a5",
    kind: "follow",
    line: "3 new followers on X",
    name: "3 new followers",
    platform: "x",
    short: "",
    time: "9m",
    unnamed: true,
  },
  {
    id: "a6",
    kind: "follow",
    line: "Subscribed to your channel",
    name: "Hana Ito",
    platform: "youtube",
    short: "New subscriber",
    time: "12m",
  },
];

const ActivityFeedDemo = () => {
  const [pane, setPane] = useState<string>("activity");
  const [autoShow, setAutoShow] = useState(true);
  return (
    <div className="rounded-panel bg-glass-content flex h-[30rem] w-full max-w-md flex-col overflow-hidden border">
      <div className="border-border flex items-center border-b px-2 py-1.5">
        <Tabs onValueChange={(value) => setPane(String(value))} value={pane}>
          <TabsList>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="buddy">
              <StatusDot tone="good" />
              Orcle
              <Badge variant="outline">1</Badge>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      {pane === "activity" ? (
        <ActivityFeed
          autoShow={autoShow}
          items={ITEMS}
          onAutoShowChange={setAutoShow}
          onShowOnStream={() => null}
          onThank={() => null}
          platforms={["youtube", "twitch", "x"]}
        />
      ) : (
        <Empty className="min-h-0 flex-1">
          <EmptyHeader>
            <EmptyDescription>
              Buddy reads chat during a live stream: questions, flags and the
              room&apos;s mood.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}
    </div>
  );
};

export default ActivityFeedDemo;
