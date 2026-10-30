/**
 * How the capture opens a demo's popup before the shot. `target` is a CSS
 * selector inside the preview; the default is the first trigger.
 */
export interface SocialOpen {
  action: "click" | "contextmenu" | "hover";
  target?: string;
}

export interface SocialPreviewOptions {
  /** Pin the demo to the top of the stage, leaving room for its popup. */
  align?: "start";
  /** The demo throws on purpose, so the capture expects console errors. */
  crashes?: boolean;
  open?: SocialOpen;
  /** Lay the demo out at this width (px) before it's scaled to fit. */
  width?: number;
  /** CSS zoom on the demo. Default 1.5; whole windows go below 1. */
  zoom?: number;
}

export interface SocialCardDefinition {
  alt: string;
  caption: string;
  category: string;
  id: string;
  pathname: string;
  /** A demo from the example registry, or a composition in components/social. */
  preview: string;
  title: string;
}

/** Previews made for the cards rather than taken from a docs page. */
export const socialCompositions = ["collection", "icons", "theme"] as const;

const TRIGGER = '[data-slot$="-trigger"]';

const openWithClick: SocialPreviewOptions = {
  align: "start",
  open: { action: "click" },
};

export const previewOptions: Record<string, SocialPreviewOptions | undefined> =
  {
    "accordion-demo": { zoom: 1.1 },
    "activity-feed-demo": { align: "start", width: 500, zoom: 0.8 },
    "alert-demo": { zoom: 1.15 },
    "alert-dialog-demo": { open: { action: "click" } },
    "chart-demo": { zoom: 1.1 },
    "chat-composer-demo": { width: 380, zoom: 1.1 },
    "chat-message-demo": { width: 400, zoom: 1.05 },
    "chat-toolbar-demo": { align: "start", width: 400, zoom: 1.05 },
    "chrome-row-demo": { zoom: 1.2 },
    "collapsible-demo": { align: "start", open: { action: "click" } },
    collection: { zoom: 1 },
    "command-demo": { zoom: 0.95 },
    "confirm-dialog-demo": { open: { action: "click", target: "button" } },
    "context-menu-demo": { open: { action: "contextmenu", target: TRIGGER } },
    "device-picker-demo": openWithClick,
    "dialog-demo": { open: { action: "click" } },
    "disabled-reason-demo": {
      open: { action: "hover", target: '[data-slot="disabled-reason"]' },
    },
    "dropdown-menu-demo": openWithClick,
    "error-boundary-demo": {
      crashes: true,
      open: { action: "click", target: 'button:has-text("Simulate a crash")' },
    },
    "field-demo": { zoom: 0.85 },
    "hover-card-demo": { align: "start", open: { action: "hover" } },
    icons: { zoom: 1 },
    "info-tooltip-demo": {
      open: { action: "hover", target: '[data-slot="badge"]' },
    },
    "kebab-context-menu-demo": {
      open: { action: "contextmenu", target: TRIGGER },
    },
    "kebab-menu-demo": openWithClick,
    "list-row-demo": { zoom: 1 },
    "lock-alert-demo": { zoom: 1 },
    "media-card-demo": { zoom: 1 },
    "navigable-row-demo": { zoom: 1 },
    "page-demo": { zoom: 0.85 },
    "page-tabs-demo": { zoom: 0.85 },
    "pane-demo": { zoom: 0.85 },
    "panel-section-demo": { zoom: 0.9 },
    "popover-demo": openWithClick,
    "power-slider-demo": { zoom: 1.25 },
    "scroll-area-demo": { zoom: 1 },
    "section-label-demo": { zoom: 1 },
    "select-demo": { open: { action: "click" } },
    "shortcut-tooltip-demo": { open: { action: "hover", target: "button" } },
    "skeleton-demo": { zoom: 1 },
    "sonner-demo": { open: { action: "click", target: "button" } },
    "spinner-demo": { zoom: 2.5 },
    "status-bar-action-demo": { zoom: 1.2 },
    "status-bar-demo": { zoom: 0.82 },
    "stream-manager-demo": { width: 940, zoom: 0.46 },
    "stream-manager-status-bar-demo": { width: 760, zoom: 0.57 },
    "stream-stats-bar-demo": { width: 700, zoom: 0.62 },
    theme: { zoom: 1 },
    "theme-toggle-demo": { zoom: 3 },
    "tooltip-demo": { open: { action: "hover" } },
    "window-frame-demo": { zoom: 0.95 },
  };

/** What each preview shows, for the image's alt text. */
export const previewDescriptions: Record<string, string | undefined> = {
  "accordion-demo": "an accordion with Video open and Audio and Output closed",
  "activity-feed-demo":
    "the Stream Manager's Activity pane with platform filters, Auto-show, a super chat, a resub, gifted subs and a raid",
  "alert-demo":
    "a warning alert, Stream health is poor, with an Open Health button",
  "alert-dialog-demo":
    "an open alert dialog asking to delete a saved scene, with Cancel and a destructive Delete scene button",
  "avatar-demo": "three round avatars, one picture and two sets of initials",
  "badge-demo": "badges for On air, Connected, 9:16 and 1080p60",
  "button-demo":
    "a red Record button, a chrome Go Live button, a glass Open Stream Manager button and a ghost Cancel",
  "chart-demo": "a line chart of upload bitrate dipping below its target",
  "chat-composer-demo":
    "the chat composer with its To: All picker, a message field and the X read-only note",
  "chat-message-demo":
    "chat messages from YouTube, Twitch and X, one from a member and one shown on stream",
  "chat-platform-demo":
    "platform names and glyphs for YouTube, Twitch, X, TikTok, Instagram, Facebook and custom RTMP",
  "chat-toolbar-demo":
    "the chat toolbar with platform chips, Questions, Mentions and search above the chat",
  "checkbox-demo": "a checked checkbox, Include markers in the export",
  "chrome-ground-demo":
    "the frosted chrome ground under a sidebar of Studio, Sources and Library",
  "chrome-row-demo":
    "chat rows in chrome, one shown on stream and one from a member",
  "collapsible-demo":
    "open advanced settings: keyframe interval, B-frames and encoder preset",
  collection:
    "Record, Go Live and Open Preview buttons, a theme switch, a slider and status badges",
  "command-demo":
    "a command palette of session actions and pages with their shortcuts",
  "confirm-dialog-demo":
    "an open confirm dialog asking to delete a saved scene",
  "context-menu-demo":
    "a context menu at the pointer with Rename, Duplicate and a destructive Delete scene",
  "device-picker-demo":
    "an open camera picker with FaceTime HD Camera checked and Cam Link 4K needing permission",
  "dialog-demo":
    "an open Rename scene dialog with a name field, Cancel and Save",
  "disabled-reason-demo":
    "a disabled Go Live button whose tooltip says to add a destination first",
  "dropdown-menu-demo":
    "an open menu with Rename, Duplicate, Show in Finder and a destructive Delete recording",
  "empty-demo": "an empty state, No recordings yet, with an Open Studio button",
  "error-boundary-demo":
    "a pane after a crash, This pane hit a problem, with Reload pane and Copy details",
  "fader-demo": "a microphone fader at −6 dB above a decibel scale",
  "field-demo":
    "a form with a title and its character count, a description and a Made for kids switch",
  "hover-card-demo": "a hover card previewing a live Twitch stream",
  icons: "twelve semantic icons, from Record and Go Live to Clip and Library",
  "info-tooltip-demo":
    "a tooltip explaining a failed MP4 export: the disk is full",
  "input-demo": "a Stream title text field",
  "input-group-demo": "a search field with an icon and a count of 12 results",
  "kbd-demo": "arrow and Esc keycaps beside what they do",
  "kebab-context-menu-demo":
    "a row's right-click menu with Rename, Show in Finder and Delete scene",
  "kebab-menu-demo": "a list of recordings with one row's ⋯ menu open",
  "label-demo": "a checkbox and its label, Include markers in the export",
  "list-row-demo":
    "grouped lists of cameras and microphones, one not responding",
  "lock-alert-demo": "locked controls with View Premium and Sign in actions",
  "media-card-demo":
    "three media cards for screen and camera layouts, one selected",
  "navigable-row-demo":
    "session rows for camera, microphone, recording, destinations and dropped frames",
  "page-demo": "an Output page of recording and livestream settings",
  "page-tabs-demo":
    "a Settings page with General, Recording and Shortcuts tabs and switch rows",
  "pane-demo": "a Sources pane of video and audio sources in grouped lists",
  "panel-section-demo":
    "a Recording section with a folder button, switch rows and a Markers row",
  "parameter-slider-demo":
    "a Microphone sync slider with a millisecond field and a description",
  "pin-window-button-demo": "a Notes window header with its pin button",
  "platform-filter-demo": "a platform filter of All, YouTube, Twitch and X",
  "popover-demo": "an open Add a marker popover with a note field",
  "power-slider-demo":
    "a Noise cleanup slider at 60% with a Beta tag and a reset button",
  "progress-demo": "a progress bar, Uploading recording at 42%",
  "scroll-area-demo": "a scrolling list of recordings and their lengths",
  "section-label-demo":
    "a sidebar with a Setup section of Sources, Scene, Assets and Livestream",
  "segmented-control-demo":
    "a Light, Dark and System segmented control with System selected",
  "select-demo": "an open select of frame rates with 60 fps checked",
  "separator-demo":
    "hairlines between a heading and Studio, Sources and Library",
  "shortcut-keys-demo":
    "Search, Open Preview, Open Stream Manager and Start or stop recording with their shortcuts",
  "shortcut-tooltip-demo":
    "a Search tooltip with its ⌘K keycap over a row of icon buttons",
  "skeleton-demo": "a loading skeleton of a picture and two lines of text",
  "slider-demo": "a Buddy motion slider",
  "sonner-demo": "a Recording saved toast over a Save local recording button",
  "spinner-demo": "two spinners at two sizes",
  "status-badge-demo":
    "status badges for Connected, Reconnecting, Upload failed, On air and Idle",
  "status-bar-action-demo":
    "a status bar with its destinations, a clip action and pane toggles",
  "status-bar-demo":
    "a window's status bar with the on-air clock and shortcut hints",
  "status-dot-demo":
    "status dots for Recording, Ready, Reconnecting, Encoder stopped and Idle",
  "stream-manager-demo":
    "Videorc's Stream Manager window with live stats, platform chat, a paid message, the composer and the status bar",
  "stream-manager-status-bar-demo":
    "the Stream Manager's status bar with platform dots, shortcut hints and clip controls",
  "stream-stats-bar-demo":
    "the Stream Manager's stats bar: on air, the session clock, viewers, followers, supporters and chat pace",
  "switch-demo": "a Made for kids switch with its description",
  "tabs-demo": "Chat, Activity and Buddy tabs with Chat selected",
  "textarea-demo": "a description textarea with its hint",
  theme: "chrome, glass and record LED buttons above status chips in each tone",
  "theme-toggle-demo": "the light and dark theme toggle",
  "toggle-demo": "a pressed pin toggle beside a visibility toggle and Markers",
  "toggle-group-demo":
    "a toggle group of All, YouTube and Twitch with All pressed",
  "tooltip-demo": "a Preview tooltip over a row of icon buttons",
  "window-frame-demo":
    "a Notes window with traffic lights, a pinned header, a list and a status bar",
};

/** Pages documenting an item preview that item's lead demo, `<slug>-demo`. */
const ITEM_SECTIONS = ["components", "primitives", "blocks"] as const;

/** Every other page borrows the preview that shows what it's about. */
const pagePreviews: Record<string, string | undefined> = {
  "/": "stream-manager-demo",
  "/docs": "collection",
  "/docs/blocks": "stream-manager-demo",
  "/docs/components": "collection",
  "/docs/concepts/design-language": "collection",
  "/docs/concepts/desktop": "window-frame-demo",
  "/docs/concepts/desktop-scale": "list-row-demo",
  "/docs/concepts/electron": "window-frame-demo",
  "/docs/concepts/icons": "icons",
  "/docs/concepts/theme": "theme",
  "/docs/hooks": "shortcut-keys-demo",
  "/docs/hooks/accelerator": "shortcut-keys-demo",
  "/docs/hooks/modal-open": "dialog-demo",
  "/docs/hooks/platform": "kbd-demo",
  "/docs/hooks/status-word": "status-badge-demo",
  "/docs/hooks/use-reduced-motion": "progress-demo",
  "/docs/hooks/use-theme-toggle": "segmented-control-demo",
  "/docs/installation": "collection",
  "/docs/primitives": "page-tabs-demo",
};

const home: SocialCardDefinition = {
  alt: "videorc/ui: Videorc's Stream Manager window, with live stats, platform chat, a paid message, the composer and the status bar, in the dark theme.",
  caption:
    "Desktop-sized controls, menus, rows and windows for React and shadcn/ui, built on Base UI.",
  category: "Component library / React",
  id: "home",
  pathname: "/",
  preview: "stream-manager-demo",
  title: "Videorc's components, in your project.",
};

/** Past this, a description reads as a paragraph: the card takes its first sentence. */
const LONG_CAPTION = 150;
const FIRST_SENTENCE = /^.+?[.!?](?=\s|$)/u;

export const captionFor = (description: string): string =>
  description.length > LONG_CAPTION
    ? (FIRST_SENTENCE.exec(description)?.[0] ?? description)
    : description;

interface SocialPage {
  data: { description?: string; title: string };
  url: string;
}

export const previewForPage = (pathname: string): string => {
  const [section, slug] = pathname.split("/").slice(2);
  const isItem = ITEM_SECTIONS.some((name) => name === section);
  if (isItem && slug) {
    return `${slug}-demo`;
  }
  return pagePreviews[pathname] ?? "collection";
};

const altFor = (title: string, preview: string): string =>
  `${title} — videorc/ui: ${previewDescriptions[preview] ?? "the live component"}, in the dark theme.`;

const categoryForPage = (pathname: string): string => {
  const [section, slug = ""] = pathname.split("/").slice(2);
  if (section === "components" && slug) {
    return "Component / React";
  }
  if (section === "primitives" && slug) {
    return "Primitive / React";
  }
  if (section === "blocks" && slug) {
    return "Block / React";
  }
  if (section === "hooks" && slug) {
    return slug.startsWith("use-") ? "Hook / React" : "Library / TypeScript";
  }
  if (section === "concepts") {
    return "Concept / React";
  }
  return "Documentation / React";
};

const idForPage = (pathname: string): string =>
  pathname === "/docs"
    ? "introduction"
    : pathname.slice("/docs/".length).replaceAll("/", "-");

export const getSocialCards = (pages: SocialPage[]): SocialCardDefinition[] => [
  home,
  ...pages.map((page) => ({
    alt: altFor(page.data.title, previewForPage(page.url)),
    caption: captionFor(
      page.data.description ??
        "The Videorc component library for React and shadcn/ui."
    ),
    category: categoryForPage(page.url),
    id: idForPage(page.url),
    pathname: page.url,
    preview: previewForPage(page.url),
    title: page.data.title,
  })),
];
