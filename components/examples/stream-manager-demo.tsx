"use client";

import { useEffect, useState } from "react";

import type { ActivityItem } from "@/components/blocks/stream-manager/activity-feed";
import type { ChatComposerCommand } from "@/components/blocks/stream-manager/chat-composer";
import type { ChatMessageData } from "@/components/blocks/stream-manager/chat-message";
import type { ChatDestination } from "@/components/blocks/stream-manager/chat-platform";
import { StreamManager } from "@/components/blocks/stream-manager/stream-manager";
import type { StreamHighlight } from "@/components/blocks/stream-manager/stream-manager";
import type { HighlightPosition } from "@/components/blocks/stream-manager/stream-manager-status-bar";
import { DEFAULT_STATS_LAYOUT } from "@/components/blocks/stream-manager/stream-stats-bar";
import type {
  StatItem,
  StatsLayout,
} from "@/components/blocks/stream-manager/stream-stats-bar";
import { SparkleIcon } from "@/components/icons";
import { StatusDot } from "@/components/status-dot";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const STARTED_SECONDS = 30 * 60 + 44;
const SECONDS_PER_MINUTE = 60;
const TICK_MS = 1000;
const ARRIVAL_MS = 6000;
const APPLY_MS = 500;
const SEND_MS = 700;
const MOST_MESSAGES = 40;

const clock = (seconds: number): string =>
  `${Math.floor(seconds / SECONDS_PER_MINUTE)}:${String(seconds % SECONDS_PER_MINUTE).padStart(2, "0")}`;

const statItems = (seconds: number, chatPace: number): StatItem[] => [
  {
    badge: "live",
    description: `On air for ${clock(seconds)}`,
    details: [{ label: "Started", value: "8:12 PM" }],
    id: "session",
    label: "Session",
    tone: "neutral",
    value: clock(seconds),
  },
  {
    description: "1.2k viewers, peak 1.4k",
    details: [
      { label: "YouTube", platform: "youtube", value: "812" },
      { label: "Twitch", platform: "twitch", value: "356" },
      { label: "X", platform: "x", value: "64" },
      { label: "Peak", value: "1.4k" },
    ],
    id: "viewers",
    label: "Viewers",
    spark: [880, 940, 1010, 990, 1080, 1150, 1120, 1232],
    tone: "neutral",
    value: "1.2k",
  },
  {
    delta: "+12",
    description: "61,942 followers, +12 this stream",
    details: [
      {
        label: "YouTube subscribers",
        note: "+9 this stream",
        platform: "youtube",
        value: "48,310",
      },
      {
        label: "Twitch followers",
        note: "+3 this stream",
        platform: "twitch",
        value: "13,632",
      },
    ],
    id: "followers",
    label: "Followers",
    tone: "neutral",
    unit: "followers",
    value: "61,942",
  },
  {
    description: "8 new supporters this stream",
    details: [{ label: "New this stream", value: "8" }],
    id: "supporters",
    label: "Supporters this stream",
    tone: "neutral",
    unit: "supporters",
    value: "8",
  },
  {
    description: "Tips this stream: $20, 300 bits",
    details: [
      { label: "Super Chats (USD)", value: "$20" },
      { label: "Bits", value: "300" },
    ],
    id: "tips",
    label: "Tips this stream",
    tone: "neutral",
    value: "$20 · 300 bits",
  },
  {
    description: `${chatPace} messages a minute`,
    details: [
      { label: "Messages in the last minute", value: String(chatPace) },
    ],
    id: "chat",
    label: "Chat",
    tone: "neutral",
    unit: "msg/min",
    value: String(chatPace),
  },
];

const DESTINATIONS: ChatDestination[] = [
  {
    accountLabel: "Night Owl Studio",
    id: "yt",
    platform: "youtube",
    state: "connected",
    write: "ready",
  },
  {
    accountLabel: "nightowlstudio",
    id: "tw",
    platform: "twitch",
    state: "connected",
    write: "ready",
  },
  {
    accountLabel: "@nightowlstudio",
    id: "x",
    platform: "x",
    state: "connected",
    write: "read-only",
  },
];

const MESSAGES: ChatMessageData[] = [
  {
    authorName: "Maya Chen",
    id: "m1",
    platform: "youtube",
    text: "Which microphone are you using on stream today?",
    time: "8:39 PM",
  },
  {
    authorName: "nightowl_jonas",
    authorRoles: ["member"],
    id: "m2",
    platform: "twitch",
    text: "The new two-camera scene looks so clean.",
    time: "8:40 PM",
  },
  {
    authorName: "Priya Raman",
    id: "m3",
    platform: "x",
    text: "Watching from Lisbon. Audio is perfectly in sync!",
    time: "8:40 PM",
  },
  {
    amountText: "$20.00",
    authorName: "Leo Park",
    id: "m4",
    kind: "paid",
    platform: "youtube",
    text: "Bought my first capture card because of this channel!",
    time: "8:41 PM",
  },
  {
    authorName: "kai.streams",
    firstMessage: true,
    id: "m5",
    platform: "twitch",
    text: "@nightowlstudio first time here, is this the Studio scene you built last week?",
    time: "8:41 PM",
  },
  {
    authorName: "Ana Silva",
    authorRoles: ["moderator"],
    id: "m6",
    platform: "youtube",
    reply: { authorName: "Maya Chen", text: "Which microphone are you using?" },
    text: "It's the Shure MV7, he said it last week.",
    time: "8:42 PM",
  },
  {
    authorName: "Sam Okafor",
    id: "m7",
    platform: "twitch",
    text: "What mic is that? Sounds great",
    time: "8:42 PM",
  },
  {
    authorName: "Hana Ito",
    id: "m8",
    platform: "x",
    text: "Can you show the scene setup again?",
    time: "8:43 PM",
  },
];

/** New chat while the window is open, one every few seconds. */
const ARRIVALS: Omit<ChatMessageData, "id" | "time">[] = [
  { authorName: "pixelpilot", platform: "twitch", text: "Raid squad says hi!" },
  {
    authorName: "Maya Chen",
    platform: "youtube",
    text: "The captions are so fast now.",
  },
  { authorName: "Priya Raman", platform: "x", text: "Clip that!" },
  {
    authorName: "nightowl_jonas",
    authorRoles: ["member"],
    platform: "twitch",
    text: "Fourteen months and the stream keeps getting better.",
  },
  {
    authorName: "Leo Park",
    platform: "youtube",
    text: "Will you put the overlay pack in the description?",
  },
];

/** Messages behind Buddy's open question: two people asking about the mic. */
const QUESTION_IDS = new Set(["m1", "m7"]);
const MENTION_NAMES = ["@nightowlstudio"];

const ACTIVITY: ActivityItem[] = [
  {
    id: "a1",
    kind: "super-chat",
    line: "Sent a $20.00 Super Chat",
    message: "Bought my first capture card because of this channel!",
    messageId: "m4",
    name: "Leo Park",
    platform: "youtube",
    short: "Super Chat · $20.00",
    time: "2m",
  },
  {
    id: "a2",
    kind: "subscription",
    line: "Resubscribed for 14 months at Tier 1",
    message: "Fourteen months of two-camera streams.",
    name: "nightowl_jonas",
    platform: "twitch",
    short: "Resub · 14 months",
    time: "4m",
  },
  {
    gift: true,
    id: "a3",
    kind: "subscription",
    line: "Gifted 5 Tier 1 subs to the community",
    name: "kai.streams",
    platform: "twitch",
    short: "Gifted 5 subs",
    time: "6m",
  },
  {
    id: "a4",
    kind: "raid",
    line: "Raided with 42 viewers",
    name: "pixelpilot",
    platform: "twitch",
    short: "Raid · 42 viewers",
    time: "9m",
  },
  {
    id: "a5",
    kind: "follow",
    line: "3 new followers on X",
    name: "3 new followers",
    platform: "x",
    short: "",
    time: "12m",
    unnamed: true,
  },
];

const COMMANDS: ChatComposerCommand[] = [
  {
    argument: true,
    hint: " [title] · Save a timeline point",
    value: "/marker",
  },
  { hint: " · Save the last 30 seconds as a clip", value: "/clip" },
  { hint: " · Save the last minute as a clip", value: "/clip 60" },
  { hint: " · Hide screen", value: "/hide" },
  { hint: " · Show screen", value: "/show" },
  { hint: " · Command help", value: "/help" },
];

// Stand-ins for the macOS traffic lights, which the OS draws in a real window.
const TrafficLights = () => (
  <div aria-hidden className="absolute top-3.5 left-5 z-10 flex gap-2">
    <span className="bg-foreground/20 size-3 rounded-full" />
    <span className="bg-foreground/20 size-3 rounded-full" />
    <span className="bg-foreground/20 size-3 rounded-full" />
  </div>
);

/** The Buddy pane, as this demo draws it: its header and one question card. */
const BuddyPane = ({ onShowQuestion }: { onShowQuestion: () => void }) => {
  const [answered, setAnswered] = useState(false);
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="border-border flex min-h-9 shrink-0 items-center gap-2 border-b px-3 py-1">
        <span className="text-xs font-medium">Orcle</span>
        <Badge variant="outline">Alpha</Badge>
        <span className="flex-1" />
        <StatusDot label="Listening" pulse tone="good" />
      </div>
      <div className="flex flex-col gap-2 p-3">
        {answered ? (
          <p className="text-muted-foreground text-xs">
            Orcle reads chat during a live stream: questions, flags and the
            room&apos;s mood.
          </p>
        ) : (
          <Alert icon={SparkleIcon}>
            <AlertTitle>2 people asking</AlertTitle>
            <AlertDescription>
              Which microphone are you using on stream today?
            </AlertDescription>
            <div className="col-start-2 mt-1.5 flex flex-wrap gap-1">
              <Button onClick={onShowQuestion} size="xs" variant="secondary">
                Show on stream
              </Button>
              <Button
                onClick={() => setAnswered(true)}
                size="xs"
                variant="ghost"
              >
                Answered
              </Button>
            </div>
          </Alert>
        )}
      </div>
    </div>
  );
};

const nowTime = (): string =>
  new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

const StreamManagerDemo = () => {
  const [seconds, setSeconds] = useState(STARTED_SECONDS);
  const [messages, setMessages] = useState(MESSAGES);
  const [activity, setActivity] = useState(ACTIVITY);
  const [arrived, setArrived] = useState(0);
  const [highlight, setHighlight] = useState<StreamHighlight | null>({
    messageId: "m3",
    phase: "live",
  });
  const [layout, setLayout] = useState<StatsLayout>(DEFAULT_STATS_LAYOUT);
  const [pinned, setPinned] = useState(true);
  const [position, setPosition] = useState<HighlightPosition>("bottom-left");
  const [screenHidden, setScreenHidden] = useState(false);
  const [autoShow, setAutoShow] = useState(true);
  const [pending, setPending] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setSeconds((value) => value + 1), TICK_MS);
    return () => clearInterval(timer);
  }, []);
  useEffect(() => {
    let count = 0;
    const timer = setInterval(() => {
      count += 1;
      const next = ARRIVALS[(count - 1) % ARRIVALS.length];
      setArrived(count);
      if (next) {
        setMessages((current) =>
          [...current, { ...next, id: `new-${count}`, time: nowTime() }].slice(
            -MOST_MESSAGES
          )
        );
      }
    }, ARRIVAL_MS);
    return () => clearInterval(timer);
  }, []);

  // A show takes a moment while Studio puts it on stream.
  const toggleOnStream = (messageId: string): void => {
    if (highlight?.messageId === messageId && highlight.phase === "live") {
      setHighlight(null);
      return;
    }
    setHighlight({ messageId, phase: "applying" });
    setTimeout(() => setHighlight({ messageId, phase: "live" }), APPLY_MS);
  };

  return (
    // The window and the stand-in traffic lights on its title row.
    <div className="relative h-[40rem] w-full">
      <TrafficLights />
      <StreamManager
        activity={activity}
        autoShow={autoShow}
        buddy={{
          name: "Orcle",
          pane: <BuddyPane onShowQuestion={() => toggleOnStream("m1")} />,
          tone: "good",
          toneLabel: "Buddy is listening",
          unseen: 1,
        }}
        className="rounded-panel h-full border"
        composerCommands={COMMANDS}
        composerNotice={notice}
        composerPlaceholder="Message, /marker [title] or /clip…"
        destinationNotes={{ x: ["X live chat reads only on this stream."] }}
        destinations={DESTINATIONS}
        highlight={highlight}
        highlightPosition={position}
        live
        mentionNames={MENTION_NAMES}
        messages={messages}
        onAutoShowChange={setAutoShow}
        onClear={() => {
          setMessages([]);
          setActivity([]);
          setHighlight(null);
        }}
        onComposerCommand={(command) =>
          setNotice(
            command.startsWith("/marker")
              ? `Marker saved at ${clock(seconds)} · ${command.slice(8).trim() || "Untitled marker"}`
              : "Saving the last 30 seconds as a clip…"
          )
        }
        onHighlight={(message) => toggleOnStream(message.id)}
        onHighlightPositionChange={setPosition}
        onMarkClip={(length) =>
          setNotice(
            length === 30
              ? "Saving the last 30 seconds as a clip…"
              : "Saving the last minute as a clip…"
          )
        }
        onOpenPreview={() => setNotice("The Preview window opens.")}
        onPinnedChange={setPinned}
        onScreenPrivacy={setScreenHidden}
        onSend={(text) => {
          setNotice(null);
          setPending(true);
          setTimeout(() => {
            setPending(false);
            setMessages((current) => [
              ...current,
              {
                authorName: "Night Owl Studio",
                authorRoles: ["owner"],
                id: `sent-${current.length}`,
                platform: "youtube",
                text,
                time: nowTime(),
              },
            ]);
          }, SEND_MS);
        }}
        onShowActivityOnStream={(item) =>
          item.messageId ? toggleOnStream(item.messageId) : undefined
        }
        onStatsLayoutChange={setLayout}
        pinned={pinned}
        platform="darwin"
        questionIds={QUESTION_IDS}
        screenHidden={screenHidden}
        sendPending={pending}
        stats={statItems(seconds, 18 + (arrived % 7))}
        statsLayout={layout}
        thankYouDraft={(item) => `Thank you, ${item.name}!`}
      />
    </div>
  );
};

export default StreamManagerDemo;
