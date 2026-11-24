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

pub mod badge;
pub mod button;
pub mod chrome;
pub mod kbd;
pub mod shortcut_keys;
pub mod theme;
pub mod tokens;
pub mod window;

pub use badge::{Badge, BadgeVariant};
pub use button::{Button, ButtonSize, ButtonVariant};
pub use kbd::{Kbd, kbd_group};
pub use shortcut_keys::{ShortcutKeys, ShortcutStyle};
pub use theme::{Appearance, FONT, IncreaseContrast, ReduceMotion, TypeScale, faded_over, hsla};

/// Sets up the kit for an app: gpui-base's behaviour (focus traps, dialogs,
/// popovers, Reduce Motion). Call it once, before the first window opens.
pub fn init(cx: &mut gpui::App) {
    gpui_base::init(cx);
}
