//! Videorc's components for GPUI: the GPUI flavour of videorc-ui (Videorc
//! plan 260, D3 and D10).
//!
//! One module per registry item, named after its React twin in
//! `components/` (`button`, `switch`, `list-row` as `list_row`…), styled
//! only from [`tokens`], which `pnpm theme:build` generates from the same
//! stylesheet the React flavour wears. The app syncs these files into
//! `crates/videorc-kit/src/` and never edits them there.
//!
//! The look follows S0.4's route, which the owner judged equal to Electron
//! on macOS (2026-11-24):
//! - every window is opaque on the theme's solid, and the kit owns its frame
//!   ([`window::options`]);
//! - multi-stop chrome fills and beads are rasterised once per size and
//!   scale; the light and shade lines stay GPUI quads (S2.2c);
//! - a disabled control is pre-blended over the ground it sits on
//!   ([`faded_over`]), because GPUI fades each primitive on its own where
//!   Chromium fades the control as one group;
//! - anything that turns runs on GPUI's animation clock at 60 fps at most,
//!   and stops under Reduce Motion.

pub mod alert;
pub mod avatar;
pub mod badge;
pub mod bar_visualizer;
pub mod button;
pub mod caption_preview_backdrop;
pub mod channel_toggle;
pub mod chat_platform;
pub mod checkbox;
pub mod chrome;
pub mod collapsible;
pub mod command;
pub mod context_menu;
pub mod dialog;
pub mod dropdown_menu;
pub mod empty;
pub mod field;
pub mod hover_card;
pub mod icon;
pub mod input;
pub mod input_group;
pub mod kbd;
pub mod kebab_context_menu;
pub mod kebab_menu;
pub mod label;
pub mod lcd_screen;
pub mod list_row;
pub mod live_waveform;
pub mod media_card;
pub mod motion;
pub mod navigable_row;
pub mod page;
pub mod page_tabs;
pub mod panel_section;
pub mod pin_window_button;
pub mod platform_glyph;
pub mod popover;
pub mod progress;
pub mod qr_code;
pub mod scroll_area;
pub mod section_label;
pub mod segmented_control;
pub mod select;
pub mod selectable_text;
pub mod separator;
pub mod settings_row;
pub mod shortcut_keys;
pub mod shortcut_recorder;
pub mod skeleton;
pub mod slider;
pub mod sound_pad;
pub mod spinner;
pub mod status_badge;
pub mod status_bar;
pub mod status_bar_action;
pub mod status_dot;
pub mod switch;
pub mod tabs;
pub mod textarea;
pub mod theme;
pub mod toast;
pub mod toggle_group;
pub mod tokens;
pub mod tooltip;
pub mod tracking;
pub mod window;
pub mod window_frame;

pub use alert::{Alert, AlertVariant};
pub use avatar::Avatar;
pub use badge::{Badge, BadgeVariant, plate_shadows};
pub use bar_visualizer::{BarVisualizer, BarVisualizerState};
pub use button::{Button, ButtonSize, ButtonVariant};
pub use caption_preview_backdrop::{CaptionPreviewBackdrop, CaptionPreviewBackdropEl};
pub use channel_toggle::{
    ChannelToggle, ChannelToggleSize, ChannelToggleTone, ChannelToggleVariant, monitor_toggle,
    mute_toggle, solo_toggle,
};
pub use chat_platform::ChatPlatform;
pub use checkbox::{Checkbox, CheckboxChecked};
pub use collapsible::Collapsible;
pub use context_menu::ContextMenu;
pub use dialog::{Dialog, DialogHandle, DialogSize};
pub use dropdown_menu::{DropdownMenu, Menu, MenuAlign, MenuItem, MenuItemTone, MenuShortcut};
pub use empty::Empty;
pub use field::{Field, FieldError, FieldGroup, FieldGroupVariant, FieldOrientation};
pub use hover_card::HoverCard;
pub use icon::{IconName, icon};
pub use input::{Input, InputState};
pub use input_group::{InputGroup, InputGroupAddon, InputGroupText};
pub use kbd::{Kbd, kbd_group};
pub use kebab_context_menu::KebabContextMenu;
pub use kebab_menu::{KEBAB_HOST, KebabMenu, KebabMenuItem, KebabReveal, kebab_menu_groups};
pub use label::Label;
pub use lcd_screen::{LCD_PITCH, LcdGlassColors, LcdScreen};
pub use list_row::{GroupedList, GroupedRow, ListRow};
pub use live_waveform::LiveWaveform;
pub use media_card::MediaCard;
pub use navigable_row::NavigableRow;
pub use page::{ConfigColumn, ConfigGrid, Gallery, PageStack, Track};
pub use page_tabs::PageTabs;
pub use panel_section::PanelSection;
pub use pin_window_button::{PIN_WINDOW_LABEL, PinWindowButton};
pub use platform_glyph::{PlatformGlyph, PlatformMark};
pub use popover::Popover;
pub use progress::Progress;
pub use qr_code::{DEFAULT_SIZE, QrCode, path_for};
pub use scroll_area::ScrollArea;
pub use section_label::SectionLabel;
pub use segmented_control::{Segment, SegmentedControl};
pub use select::{Select, SelectOption, SelectSize, SelectTriggerState};
pub use selectable_text::SelectableText;
pub use separator::{Separator, SeparatorOrientation};
pub use settings_row::{SettingsGroup, SettingsRow};
pub use shortcut_keys::{ShortcutKeys, ShortcutStyle};
pub use shortcut_recorder::ShortcutRecorder;
pub use skeleton::Skeleton;
pub use slider::{Slider, SliderEvent, SliderState};
pub use sound_pad::{
    SoundPad, SoundPadGrid, SoundPadMode, SoundPadProgressVariant, SoundPadSize, SoundPadVariant,
};
pub use spinner::Spinner;
pub use status_badge::StatusBadge;
pub use status_bar::{StatusBar, StatusBarHint};
pub use status_bar_action::StatusBarAction;
pub use status_dot::{StatusDot, StatusTone};
pub use switch::Switch;
pub use tabs::{Tabs, TabsVariant};
pub use textarea::{Textarea, TextareaState};
pub use theme::{
    Appearance, FONT, FONT_MONO, IncreaseContrast, ReduceMotion, TypeScale, faded_over, hsla,
};
pub use toast::{ToastData, ToastKind, Toaster, toast_card};
pub use toggle_group::{ToggleGroup, ToggleItem};
pub use tooltip::{tooltip, tooltip_with_accelerator, tooltip_with_action, tooltip_with_shortcut};
pub use tracking::TrackedText;
pub use window_frame::{WindowFrame, WindowHeader};

/// Sets up the kit for an app: gpui-base's behaviour (focus traps, dialogs,
/// popovers, Reduce Motion). Call it once, before the first window opens.
pub fn init(cx: &mut gpui::App) {
    // Videorc's copy is English only: keep gpui-base from flipping tabs,
    // sliders and popups right to left on an Arabic or Hebrew system.
    gpui_base::LayoutDirection::Ltr.set_global(cx);
    gpui_base::init(cx);
    segmented_control::init(cx);
}
