//! StatusDot (`components/status-dot.tsx`): ambient status, the glass dot,
//! optionally pulsing, and a monochrome word. It replaces a loud header
//! badge. The tone vocabulary and the word rule are `lib/status-word.ts`'s:
//! a dot says a word in sentence case ("Needs permission"), never a machine
//! value ("permission-needed").

use std::time::Duration;

use gpui::{
    Animation, AnimationExt, App, ElementId, IntoElement, SharedString, Window, div, prelude::*, px,
};

use crate::{
    chrome::box_shadow,
    theme::{Appearance, hsla, motion, resolve, with_alpha},
    tokens::{Color, Shadow, Theme},
};

/// What a status means, never how it looks: `Good` works, `Warn` is
/// degraded, `Error` failed, `Live` is recording or on air, `Neutral` is idle.
#[derive(Clone, Copy, Debug, Default, PartialEq, Eq)]
pub enum StatusTone {
    Good,
    Warn,
    Error,
    Live,
    #[default]
    Neutral,
}

impl StatusTone {
    /// The tone's colour and its glow (`tone-*`): neutral is the secondary
    /// text and never glows.
    pub fn color(self, t: &Theme) -> (Color, f32) {
        match self {
            StatusTone::Good => (t.success, t.chip_dot_glow),
            StatusTone::Warn => (t.warning, t.chip_dot_glow),
            StatusTone::Error => (t.destructive, t.chip_dot_glow),
            StatusTone::Live => (t.live, t.chip_dot_glow),
            StatusTone::Neutral => (t.muted_foreground, 0.0),
        }
    }
}

/// A lower-case, hyphenated machine value: `connected`, `device-missing`.
pub fn is_raw_status_value(text: &str) -> bool {
    !text.is_empty() && text.chars().all(|c| c.is_ascii_lowercase() || c == '-')
}

/// The last resort for a state no map names yet: `device-missing` reads
/// "Device missing". A map that names the state always wins.
pub fn status_word_from_value(value: &str) -> String {
    let spaced = value
        .split(['-', '_'])
        .filter(|part| !part.is_empty())
        .collect::<Vec<_>>()
        .join(" ");
    let mut chars = spaced.chars();
    match chars.next() {
        Some(first) => first.to_uppercase().chain(chars).collect(),
        None => spaced,
    }
}

/// The ping ring's cycle (Tailwind's `animate-ping`).
pub const PING: Duration = Duration::from_secs(1);

/// `cubic-bezier(0, 0, 0.2, 1)`, near enough: a quadratic ease-out.
fn ease_out(delta: f32) -> f32 {
    1.0 - (1.0 - delta) * (1.0 - delta)
}

/// The ping ring at `delta` through its cycle: its scale and its opacity.
/// It grows to twice the dot and fades out by 75%, then rests.
pub fn ping(delta: f32) -> (f32, f32) {
    let p = ease_out((delta / 0.75).min(1.0));
    (1.0 + p, 0.6 * (1.0 - p))
}

/// `glass-dot`: the tone, a 2 px halo at 22% and an 8 px glow.
pub(crate) fn glass_dot(tone: Color, glow: f32) -> gpui::Div {
    let mut halo = vec![box_shadow(&Shadow {
        inset: false,
        x: 0.0,
        y: 0.0,
        blur: 0.0,
        spread: 2.0,
        color: with_alpha(tone, 0.22),
    })];
    if glow > 0.0 {
        halo.push(box_shadow(&Shadow {
            inset: false,
            x: 0.0,
            y: 0.0,
            blur: 8.0,
            spread: 0.0,
            color: with_alpha(tone, glow),
        }));
    }
    div()
        .flex_none()
        .size(px(DOT))
        .rounded_full()
        .bg(hsla(tone))
        .shadow(halo)
}

const DOT: f32 = 6.0;

#[derive(IntoElement)]
pub struct StatusDot {
    id: ElementId,
    tone: StatusTone,
    label: Option<SharedString>,
    pulse: bool,
    appearance: Option<Appearance>,
}

impl StatusDot {
    pub fn new(id: impl Into<ElementId>) -> Self {
        StatusDot {
            id: id.into(),
            tone: StatusTone::Neutral,
            label: None,
            pulse: false,
            appearance: None,
        }
    }

    pub fn tone(mut self, tone: StatusTone) -> Self {
        self.tone = tone;
        self
    }

    /// A word in sentence case, already mapped from its state: never recased.
    pub fn label(mut self, label: impl Into<SharedString>) -> Self {
        let label = label.into();
        if cfg!(debug_assertions) && is_raw_status_value(&label) {
            eprintln!(
                "StatusDot got the raw status value \"{label}\". Map it to a status word first."
            );
        }
        self.label = Some(label);
        self
    }

    /// Rings out from the dot while something runs (Reduce Motion stills it).
    pub fn pulse(mut self, pulse: bool) -> Self {
        self.pulse = pulse;
        self
    }

    /// Draws in this appearance instead of the window's (the gallery).
    pub fn appearance(mut self, appearance: Appearance) -> Self {
        self.appearance = Some(appearance);
        self
    }
}

impl RenderOnce for StatusDot {
    fn render(self, window: &mut Window, cx: &mut App) -> impl IntoElement {
        let t = resolve(self.appearance, window, cx);
        let (tone, glow) = self.tone.color(t);
        let ring = (self.pulse && motion(cx)).then(|| {
            div()
                .absolute()
                .rounded_full()
                .bg(hsla(tone))
                .with_animation(
                    self.id.clone(),
                    Animation::new(PING).repeat().with_max_fps(60.0),
                    |ring, delta| {
                        let (scale, opacity) = ping(delta);
                        let size = DOT * scale;
                        let inset = (DOT - size) / 2.0;
                        ring.size(px(size))
                            .top(px(inset))
                            .left(px(inset))
                            .opacity(opacity)
                    },
                )
        });
        div()
            .flex()
            .flex_none()
            .items_center()
            .gap(px(6.0))
            .min_w(px(0.))
            .text_size(px(12.0))
            .line_height(px(16.0))
            .text_color(hsla(t.muted_foreground))
            .child(
                div()
                    .relative()
                    .flex_none()
                    .size(px(DOT))
                    .children(ring)
                    .child(glass_dot(tone, glow)),
            )
            .children(
                self.label
                    .map(|label| div().min_w(px(0.)).truncate().child(label)),
            )
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn raw_values_are_caught_and_words_pass() {
        assert!(is_raw_status_value("device-missing"));
        assert!(is_raw_status_value("connected"));
        assert!(!is_raw_status_value("Needs permission"));
        assert!(!is_raw_status_value("Ready"));
        assert!(!is_raw_status_value(""));
    }

    #[test]
    fn a_value_reads_as_a_sentence_case_word() {
        assert_eq!(status_word_from_value("device-missing"), "Device missing");
        assert_eq!(status_word_from_value("on_air"), "On air");
        assert_eq!(status_word_from_value("--"), "");
    }

    #[test]
    fn the_ping_grows_fades_then_rests() {
        assert_eq!(ping(0.0), (1.0, 0.6));
        let (scale, opacity) = ping(0.75);
        assert!((scale - 2.0).abs() < 1e-6 && opacity.abs() < 1e-6);
        assert_eq!(ping(0.75), ping(1.0));
    }
}
