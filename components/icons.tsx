import type * as PhosphorIcons from "@phosphor-icons/react";
import type { ComponentType, SVGProps } from "react";

/**
 * The Videorc icon registry: the single place an icon is named.
 *
 * Components import icons from here, never from an icon package directly.
 *
 * 1. **Meaning over shape.** Call sites ask for `SourcesIcon` or `AlertIcon`,
 *    so swapping the underlying glyph is a one-line change here instead of a
 *    hunt through every file.
 * 2. **A countable set.** Icon licences are counted in glyphs (Nucleo's
 *    open-source allowance is 100). The set stays reviewable in one file.
 *
 * The export names are the contract. A project may swap a glyph, or the whole
 * set, in its own copy of this file; every videorc/ui component keeps working
 * as long as each name still exports an `AppIcon`.
 *
 * Adding an icon: check whether an existing slot already means what you need.
 * If it does, reuse it. Only add a slot for a genuinely new meaning.
 */

/**
 * The props every registry icon accepts.
 *
 * Declared structurally rather than re-exported from the icon package, so the
 * app's own type is what call sites depend on: swapping icon sets then means
 * changing this file, not 50 others. `weight` stays in the surface because
 * Videorc's call sites pass it; a single-weight set may accept and ignore it.
 */
export type AppIconProps = {
  size?: number | string;
  weight?: "thin" | "light" | "regular" | "bold" | "fill" | "duotone";
} & Omit<SVGProps<SVGSVGElement>, "ref" | "weight">;

/**
 * An icon component. Modules that store an icon in metadata — the workspace
 * nav, row primitives — type the field as `AppIcon`.
 */
export type AppIcon = ComponentType<AppIconProps>;

// The compile-only check preserves the app prop contract. Direct re-exports
// let each consumer own its glyph chunks; optional panels must not pull the
// whole registry into the initial renderer asset graph.
type AssertIconProps<T extends Record<string, AppIcon>> = T;
/** Compile-time proof that every glyph exported below accepts `AppIconProps`. */
export type IconSetCheck = AssertIconProps<
  Pick<
    typeof PhosphorIcons,
    | "ArrowClockwise"
    | "ArrowCounterClockwise"
    | "ArrowDown"
    | "ArrowLeft"
    | "ArrowRight"
    | "ArrowSquareOut"
    | "ArrowUp"
    | "ArrowsClockwise"
    | "ArrowsDownUp"
    | "BookmarkSimple"
    | "Broadcast"
    | "Bug"
    | "CaretDown"
    | "CaretRight"
    | "CaretUp"
    | "ChatCircle"
    | "Check"
    | "CheckCircle"
    | "CircleNotch"
    | "ClosedCaptioning"
    | "Copy"
    | "Crosshair"
    | "Desktop"
    | "DeviceMobile"
    | "DotsThree"
    | "DownloadSimple"
    | "Eye"
    | "EyeSlash"
    | "FacebookLogo"
    | "FileVideo"
    | "FilmReel"
    | "FilmSlate"
    | "FloppyDisk"
    | "FolderOpen"
    | "FrameCorners"
    | "Gauge"
    | "GearSix"
    | "Heartbeat"
    | "ImageBroken"
    | "ImageSquare"
    | "Info"
    | "InstagramLogo"
    | "Layout"
    | "LinkSimple"
    | "LockKey"
    | "MagnifyingGlass"
    | "MagnifyingGlassPlus"
    | "Microphone"
    | "MinusCircle"
    | "Monitor"
    | "Moon"
    | "NotePencil"
    | "PaperPlaneRight"
    | "Pause"
    | "PencilSimple"
    | "Play"
    | "Pulse"
    | "PushPin"
    | "Record"
    | "Scissors"
    | "SignIn"
    | "SignOut"
    | "SlidersHorizontal"
    | "Sparkle"
    | "SpeakerHigh"
    | "SpeakerSlash"
    | "SquaresFour"
    | "Stop"
    | "Sun"
    | "TerminalWindow"
    | "TextAa"
    | "TiktokLogo"
    | "Trash"
    | "TwitchLogo"
    | "XLogo"
    | "YoutubeLogo"
    | "UploadSimple"
    | "UserCircle"
    | "VideoCamera"
    | "Warning"
    | "WarningCircle"
    | "Waveform"
    | "WaveformSlash"
    | "Wrench"
    | "X"
    | "XCircle"
  >
>;

/**
 * Navigation — one slot per sidebar destination. These are the icons the
 * 2026-08-25 semantic audit reviews first: several are placeholders inherited
 * from the pre-audit set (see the audit table in the Nucleo plan). The Buddy
 * tab's slot is the Buddy artwork, which stays in the app.
 */
export {
  VideoCamera as StudioIcon,
  Monitor as SourcesIcon,
  SquaresFour as SceneIcon,
  ImageSquare as AssetsIcon,
  Broadcast as LivestreamIcon,
  ClosedCaptioning as CaptionsIcon,
  Record as OutputIcon,
  FilmReel as LibraryIcon,
  GearSix as SettingsIcon,
  Pulse as HealthIcon,
} from "@phosphor-icons/react";
/**
 * Status and feedback. One glyph per meaning: a triangle warns, a circle
 * alerts, a crossed circle is an error. Never introduce a second variant of
 * an existing meaning — that is how the set grew to 100 icons.
 */
export {
  Warning as WarningIcon,
  WarningCircle as AlertIcon,
  XCircle as ErrorIcon,
  CheckCircle as SuccessIcon,
  Check as CheckIcon,
  Info as InfoIcon,
  CircleNotch as SpinnerIcon,
  Heartbeat as HeartbeatIcon,
  Gauge as GaugeIcon,
  MinusCircle as DisabledIcon,
} from "@phosphor-icons/react";
/**
 * Chrome and controls.
 */
export {
  CaretDown as ChevronDownIcon,
  CaretUp as ChevronUpIcon,
  CaretRight as ChevronRightIcon,
  X as CloseIcon,
  DotsThree as MoreIcon,
  MagnifyingGlass as SearchIcon,
  // Opens a small picture larger to look at it (the Buddy's bubble sample
  // and its preview); never a zoom level control.
  MagnifyingGlassPlus as ZoomInIcon,
  SlidersHorizontal as AdjustIcon,
  Layout as LayoutIcon,
} from "@phosphor-icons/react";
/**
 * Arrows and movement.
 */
export {
  ArrowUp as ArrowUpIcon,
  ArrowDown as ArrowDownIcon,
  ArrowLeft as ArrowLeftIcon,
  ArrowRight as ArrowRightIcon,
  ArrowSquareOut as ExternalLinkIcon,
  ArrowClockwise as RefreshIcon,
  ArrowsClockwise as SyncIcon,
  ArrowCounterClockwise as ResetIcon,
  ArrowsDownUp as SortIcon,
} from "@phosphor-icons/react";
/**
 * Capture, media and playback.
 */
export {
  VideoCamera as CameraIcon,
  Monitor as DisplayIcon,
  Desktop as DesktopIcon,
  DeviceMobile as MobileIcon,
  Microphone as MicrophoneIcon,
  SpeakerHigh as SpeakerOnIcon,
  SpeakerSlash as SpeakerOffIcon,
  Waveform as WaveformIcon,
  WaveformSlash as WaveformMutedIcon,
  Record as RecordIcon,
  Stop as StopIcon,
  Play as PlayIcon,
  // The in-app player's pause (plan 119, S11); Stop is the capture action.
  Pause as PauseIcon,
  FileVideo as VideoFileIcon,
  FilmSlate as ClapperboardIcon,
  FrameCorners as FrameIcon,
  Crosshair as CrosshairIcon,
  // A marker: a point on a recording's timeline its owner wants to find
  // again (CONTEXT.md). Never scissors, which mean a cut (plan 174 S3.12).
  BookmarkSimple as MarkerIcon,
  // Hide screen (plan 210): the screen is hidden from viewers. Never the
  // Preview's eye, which opens a window.
  EyeSlash as HiddenIcon,
} from "@phosphor-icons/react";
/**
 * Files, assets and editing.
 */
export {
  FolderOpen as FolderIcon,
  DownloadSimple as DownloadIcon,
  UploadSimple as UploadIcon,
  FloppyDisk as SaveIcon,
  Trash as DeleteIcon,
  Copy as CopyIcon,
  PencilSimple as EditIcon,
  NotePencil as NoteIcon,
  ImageSquare as ImageIcon,
  ImageBroken as ImageBrokenIcon,
  Eye as PreviewIcon,
} from "@phosphor-icons/react";
/**
 * Account, access and links.
 */
export {
  LockKey as LockIcon,
  SignIn as SignInIcon,
  SignOut as SignOutIcon,
  UserCircle as AccountIcon,
  LinkSimple as LinkIcon,
} from "@phosphor-icons/react";
/**
 * AI, tooling and appearance. Buddy (code name `cohost`) has its own mark,
 * its own artwork, which stays in the app.
 */
export {
  Sparkle as SparkleIcon,
  // Scissors means cutting only: Clean cut and clips (plan 174 S3.12, J1-22).
  Scissors as ClipIcon,
  Wrench as RepairIcon,
  Bug as BugIcon,
  TerminalWindow as TerminalIcon,
  TextAa as TextIcon,
  ChatCircle as ChatIcon,
  PaperPlaneRight as SendIcon,
  PushPin as PinIcon,
  Sun as LightModeIcon,
  Moon as DarkModeIcon,
} from "@phosphor-icons/react";
/**
 * Platform brand marks: Phosphor's renditions of third-party logos, each with
 * its owner's trademark rules. The design language keeps app and source marks
 * as the only full-colour icons on screen. Videorc swaps the YouTube and X
 * slots for the official artwork in its own copy of this file.
 */
export {
  YoutubeLogo as YoutubeIcon,
  XLogo as XPlatformIcon,
  TwitchLogo as TwitchIcon,
  TiktokLogo as TiktokIcon,
  InstagramLogo as InstagramIcon,
  FacebookLogo as FacebookIcon,
} from "@phosphor-icons/react";
