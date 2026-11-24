//! The gallery's pages for a single-pane window's frame: WindowFrame and
//! WindowHeader, StatusBar and StatusBarHint, StatusBarAction and
//! StatusDot. The words are the Electron renderer's.

use gpui::{AnyElement, App, IntoElement, Window, div, prelude::*, px};
use videorc_kit::{
    Appearance, IconName, ShortcutKeys, StatusBar, StatusBarAction, StatusBarHint, StatusDot,
    StatusTone, WindowFrame, WindowHeader, hsla, icon, tokens::radius,
};

use crate::section;

/// A frame around a demo, so a full-width bar reads as a window's edge.
fn framed(a: Appearance, body: impl IntoElement) -> impl IntoElement {
    let t = a.theme();
    div()
        .w_full()
        .overflow_hidden()
        .rounded(px(radius::ROW))
        .border_1()
        .border_color(hsla(t.border))
        .child(body)
}

fn hints(a: Appearance) -> Vec<AnyElement> {
    vec![
        StatusBarHint::new("search", ShortcutKeys::keystrokes("cmd-k"), "Search")
            .on_click(|_, _, _| {})
            .appearance(a)
            .into_any_element(),
        StatusBarHint::new("preview", ShortcutKeys::keystrokes("cmd-p"), "Preview")
            .pressed(true)
            .on_click(|_, _, _| {})
            .appearance(a)
            .into_any_element(),
        StatusBarHint::new("notes", ShortcutKeys::keystrokes("cmd-shift-n"), "Notes")
            .on_click(|_, _, _| {})
            .appearance(a)
            .into_any_element(),
        StatusBarHint::new(
            "stream-manager",
            ShortcutKeys::keystrokes("cmd-shift-j"),
            "Stream Manager",
        )
        .show_label(false)
        .on_click(|_, _, _| {})
        .appearance(a)
        .into_any_element(),
    ]
}

/// `window-frame`: a single-pane window, its header on macOS and off it,
/// with a meta fact and a control.
pub fn window_frame_page(a: Appearance, _: &mut Window, _: &mut App) -> AnyElement {
    let t = a.theme();
    div()
        .flex()
        .flex_col()
        .gap(px(20.0))
        .child(section(
            t,
            "A window",
            framed(
                a,
                div().h(px(200.0)).child(
                    WindowFrame::new()
                        .appearance(a)
                        .child(WindowHeader::new("Stream Manager").mac(true).appearance(a))
                        .child(div().flex_1())
                        .child(
                            StatusBar::new().appearance(a).leading(
                                StatusDot::new("frame-state")
                                    .tone(StatusTone::Live)
                                    .label("On air")
                                    .appearance(a),
                            ),
                        ),
                ),
            ),
        ))
        .child(section(
            t,
            "With a fact and a control",
            framed(
                a,
                WindowHeader::new("Captions reader")
                    .mac(true)
                    .meta(
                        StatusDot::new("captions-state")
                            .tone(StatusTone::Good)
                            .label("Ready")
                            .appearance(a),
                    )
                    .appearance(a)
                    .child(
                        StatusBarAction::new("clear", "Clear view")
                            .text("Clear")
                            .hint("Clear view (keeps Library history)")
                            .on_click(|_, _, _| {})
                            .appearance(a),
                    ),
            ),
        ))
        .child(section(
            t,
            "Off macOS",
            framed(a, WindowHeader::new("Notes").mac(false).appearance(a)),
        ))
        .into_any_element()
}

/// `status-bar`: the session's state on the left, the hints on the right,
/// one pressed while its window is open, one with its word hidden.
pub fn status_bar_page(a: Appearance, _: &mut Window, _: &mut App) -> AnyElement {
    let t = a.theme();
    let bar = |id: &'static str, tone: StatusTone, word: &'static str| {
        framed(
            a,
            StatusBar::new()
                .appearance(a)
                .leading(StatusDot::new(id).tone(tone).label(word).appearance(a))
                .children(hints(a)),
        )
    };
    div()
        .flex()
        .flex_col()
        .gap(px(20.0))
        .child(section(t, "Ready", bar("ready", StatusTone::Good, "Ready")))
        .child(section(
            t,
            "Recording",
            bar("recording", StatusTone::Live, "Recording"),
        ))
        .child(section(
            t,
            "Reconnecting",
            bar("reconnecting", StatusTone::Warn, "Videorc is reconnecting…"),
        ))
        .into_any_element()
}

/// `status-bar-action`: a word, an icon alone, a word with its shortcut,
/// a toggle that is on, and a disabled action.
pub fn status_bar_action_page(a: Appearance, _: &mut Window, _: &mut App) -> AnyElement {
    let t = a.theme();
    let glyph = || icon(IconName::Info, 14.0, hsla(t.subtle));
    section(
        t,
        "Actions",
        framed(
            a,
            StatusBar::new()
                .appearance(a)
                .child(
                    StatusBarAction::new("clear", "Clear view")
                        .text("Clear")
                        .hint("Clear view (keeps Library history)")
                        .on_click(|_, _, _| {})
                        .appearance(a),
                )
                .child(
                    StatusBarAction::new("preview", "Open Preview")
                        .icon(glyph())
                        .on_click(|_, _, _| {})
                        .appearance(a),
                )
                .child(
                    StatusBarAction::new("banners", "Banners")
                        .text("Banners")
                        .hint("Show or hide your banners")
                        .pressed(true)
                        .on_click(|_, _, _| {})
                        .appearance(a),
                )
                .child(
                    StatusBarAction::new("position", "Highlight position")
                        .icon(glyph())
                        .hint("Highlight position: Bottom left")
                        .keys(ShortcutKeys::keystrokes("cmd-shift-h"))
                        .on_click(|_, _, _| {})
                        .appearance(a),
                )
                .child(
                    StatusBarAction::new("disabled", "Clear view")
                        .text("Clear")
                        .disabled(true)
                        .appearance(a),
                ),
        ),
    )
    .into_any_element()
}

/// `status-dot`: every tone with its word, a pulsing dot, and a dot alone.
pub fn status_dot_page(a: Appearance, _: &mut Window, _: &mut App) -> AnyElement {
    let t = a.theme();
    let dot = |id: &'static str, tone: StatusTone, word: &'static str| {
        StatusDot::new(id)
            .tone(tone)
            .label(word)
            .appearance(a)
            .into_any_element()
    };
    div()
        .flex()
        .flex_col()
        .gap(px(20.0))
        .child(section(
            t,
            "Tones",
            div().flex().flex_col().gap(px(8.0)).children([
                dot("good", StatusTone::Good, "Ready"),
                dot("warn", StatusTone::Warn, "Videorc is reconnecting…"),
                dot("error", StatusTone::Error, "Failed"),
                dot("live", StatusTone::Live, "On air"),
                dot("neutral", StatusTone::Neutral, "Not ready"),
            ]),
        ))
        .child(section(
            t,
            "Pulsing, and alone",
            div()
                .flex()
                .items_center()
                .gap(px(16.0))
                .child(
                    StatusDot::new("pulse")
                        .tone(StatusTone::Live)
                        .label("Recording")
                        .pulse(true)
                        .appearance(a),
                )
                .child(StatusDot::new("alone").tone(StatusTone::Good).appearance(a)),
        ))
        .into_any_element()
}
