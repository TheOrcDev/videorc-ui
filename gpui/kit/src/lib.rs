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
pub mod badge;
pub mod button;
pub mod chrome;
pub mod dialog;
pub mod icon;
pub mod input;
pub mod kbd;
pub mod list_row;
pub mod motion;
pub mod navigable_row;
pub mod panel_section;
pub mod popover;
pub mod scroll_area;
pub mod section_label;
pub mod select;
pub mod shortcut_keys;
pub mod skeleton;
pub mod slider;
pub mod switch;
pub mod tabs;
pub mod theme;
pub mod toast;
pub mod tokens;
pub mod tooltip;
pub mod window;

pub use alert::{Alert, AlertVariant};
pub use badge::{Badge, BadgeVariant};
pub use button::{Button, ButtonSize, ButtonVariant};
pub use dialog::{Dialog, DialogHandle, DialogSize};
pub use icon::{IconName, icon};
pub use input::{Input, InputState};
pub use kbd::{Kbd, kbd_group};
pub use list_row::{GroupedList, GroupedRow, ListRow};
pub use navigable_row::NavigableRow;
pub use panel_section::PanelSection;
pub use popover::Popover;
pub use scroll_area::ScrollArea;
pub use section_label::SectionLabel;
pub use select::Select;
pub use shortcut_keys::{ShortcutKeys, ShortcutStyle};
pub use skeleton::Skeleton;
pub use slider::{Slider, SliderEvent, SliderState};
pub use switch::Switch;
pub use tabs::{Tabs, TabsVariant};
pub use theme::{Appearance, FONT, IncreaseContrast, ReduceMotion, TypeScale, faded_over, hsla};
pub use toast::{ToastData, ToastKind, Toaster, toast_card};
pub use tooltip::{tooltip, tooltip_with_shortcut};

/// Sets up the kit for an app: gpui-base's behaviour (focus traps, dialogs,
/// popovers, Reduce Motion). Call it once, before the first window opens.
pub fn init(cx: &mut gpui::App) {
    // Videorc's copy is English only: keep gpui-base from flipping tabs,
    // sliders and popups right to left on an Arabic or Hebrew system.
    gpui_base::LayoutDirection::Ltr.set_global(cx);
    gpui_base::init(cx);
}
