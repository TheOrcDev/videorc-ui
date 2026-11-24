//! The gallery's pages for a window's frame: WindowFrame with WindowHeader,
//! StatusBar with StatusBarHint, StatusBarAction and StatusDot. The words
//! are the Electron renderer's (the Stream Manager, Notes and Captions).

use gpui::{AnyElement, App, IntoElement, Window, div, prelude::*, px};
use videorc_kit::{
    Appearance, Button, ButtonSize, ButtonVariant, IconName, PinWindowButton, ShortcutKeys,
    StatusBar, StatusBarAction, StatusBarHint, StatusDot, StatusTone, WindowFrame, WindowHeader,
    hsla, icon, status_bar::ACTION_ICON, tokens::radius,
};

use crate::section;

/// A window-sized box to draw a frame in.
fn framed(a: Appearance, body: impl IntoElement) -> impl IntoElement {
    let t = a.theme();
    div()
        .w(px(420.0))
        .h(px(140.0))
        .rounded(px(radius::PANEL))
        .overflow_hidden()
        .border_1()
        .border_color(hsla(t.border))
        .child(body)
}

/// `window-frame`: the Stream Manager's title-only header, Captions' header
/// with its state and a control, and the header off macOS.
pub fn window_frame_page(a: Appearance, _: &mut Window, _: &mut App) -> AnyElement {
    let t = a.theme();
    div()
        .flex()
        .flex_col()
        .gap(px(20.0))
        .child(section(
            t,
            "Title only",
            framed(
                a,
                WindowFrame::new()
                    .appearance(a)
                    .child(WindowHeader::new("Stream Manager").mac(true).appearance(a)),
            ),
        ))
        .child(section(
            t,
            "With its state and a control",
            framed(
                a,
                WindowFrame::new().appearance(a).child(
                    WindowHeader::new("Captions")
                        .mac(true)
                        .meta(
                            StatusDot::new("captions-state")
                                .tone(StatusTone::Good)
                                .label("Listening")
                                .appearance(a),
                        )
                        .appearance(a)
                        .child(
                            Button::new("captions-clear")
                                .label("Clear")
                                .variant(ButtonVariant::Ghost)
                                .size(ButtonSize::Xs)
                                .appearance(a),
                        ),
                ),
            ),
        ))
        .child(section(
            t,
            "Windows and Linux",
            framed(
                a,
                WindowFrame::new()
                    .appearance(a)
                    .child(WindowHeader::new("Notes").mac(false).appearance(a)),
            ),
        ))
        .into_any_element()
}

/// `status-bar`: the state on the left, the hints on the right, one hint
/// pressed (its window is open) and one with its key alone.
pub fn status_bar_page(a: Appearance, _: &mut Window, _: &mut App) -> AnyElement {
    let t = a.theme();
    div()
        .w(px(560.0))
        .child(section(
            t,
            "Status bar",
            StatusBar::new()
                .appearance(a)
                .leading(
                    StatusDot::new("chat-state")
                        .tone(StatusTone::Good)
                        .label("Connected")
                        .appearance(a),
                )
                .child(
                    StatusBarHint::new("search", "Search", ShortcutKeys::keystrokes("cmd-f"))
                        .on_click(|_, _, _| {})
                        .appearance(a),
                )
                .child(
                    StatusBarHint::new("write", "Write", ShortcutKeys::keystrokes("cmd-l"))
                        .on_click(|_, _, _| {})
                        .appearance(a),
                )
                .child(
                    StatusBarHint::new("sidekick", "Sidekick", ShortcutKeys::keystrokes("cmd-j"))
                        .pressed(true)
                        .on_click(|_, _, _| {})
                        .appearance(a),
                )
                .child(
                    StatusBarHint::new("notes", "Notes", ShortcutKeys::keystrokes("cmd-shift-n"))
                        .show_label(false)
                        .on_click(|_, _, _| {})
                        .appearance(a),
                ),
        ))
        .into_any_element()
}

/// `status-bar-action`: a word, an icon with a hint, a pressed toggle and a
/// disabled action, in a status bar.
pub fn status_bar_action_page(a: Appearance, _: &mut Window, _: &mut App) -> AnyElement {
    let t = a.theme();
    let glyph = |name: IconName| icon(name, ACTION_ICON, hsla(t.subtle));
    div()
        .w(px(560.0))
        .child(section(
            t,
            "Actions",
            StatusBar::new()
                .appearance(a)
                .child(
                    StatusBarAction::new("banners", "Banners")
                        .text("Banners")
                        .hint("Show or hide your banners (or type /banner)")
                        .on_click(|_, _, _| {})
                        .appearance(a),
                )
                .child(
                    StatusBarAction::new("clear", "Clear view")
                        .text("Clear")
                        .hint("Clear view (keeps Library history)")
                        .on_click(|_, _, _| {})
                        .appearance(a),
                )
                .child(
                    StatusBarAction::new("highlight", "Highlight position")
                        .icon(glyph(IconName::Info))
                        .pressed(true)
                        .on_click(|_, _, _| {})
                        .appearance(a),
                )
                .child(
                    StatusBarAction::new("sounds", "Sounds")
                        .text("Sounds")
                        .hint("Play a sound (or type /sound)")
                        .disabled(true)
                        .appearance(a),
                ),
        ))
        .into_any_element()
}

/// `pin-window-button`: Keep on top in a WindowHeader (Notes) and in a
/// status bar (Stream Manager), pinned and unpinned.
pub fn pin_window_button_page(a: Appearance, _: &mut Window, _: &mut App) -> AnyElement {
    let t = a.theme();
    div()
        .flex()
        .flex_col()
        .gap(px(20.0))
        .child(section(
            t,
            "In a header",
            framed(
                a,
                WindowFrame::new().appearance(a).child(
                    WindowHeader::new("Notes").mac(true).appearance(a).child(
                        PinWindowButton::new("pin-header")
                            .pinned(true)
                            .on_pinned_change(|_, _, _, _| {})
                            .appearance(a),
                    ),
                ),
            ),
        ))
        .child(section(
            t,
            "In a status bar",
            StatusBar::new().appearance(a).child(
                PinWindowButton::new("pin-status")
                    .status_bar()
                    .pinned(false)
                    .on_pinned_change(|_, _, _, _| {})
                    .appearance(a),
            ),
        ))
        .into_any_element()
}

/// `status-dot`: every tone with its word, a pulsing live dot, and a dot
/// alone.
pub fn status_dot_page(a: Appearance, _: &mut Window, _: &mut App) -> AnyElement {
    let t = a.theme();
    let tones = [
        ("good", StatusTone::Good, "Connected"),
        ("warn", StatusTone::Warn, "Reconnecting"),
        ("error", StatusTone::Error, "Disconnected"),
        ("live", StatusTone::Live, "Live"),
        ("neutral", StatusTone::Neutral, "Off air"),
    ];
    div()
        .flex()
        .flex_col()
        .gap(px(20.0))
        .child(section(
            t,
            "Tones",
            div().flex().flex_col().gap(px(8.0)).children(
                tones.into_iter().map(|(id, tone, words)| {
                    StatusDot::new(id).tone(tone).label(words).appearance(a)
                }),
            ),
        ))
        .child(section(
            t,
            "Pulsing and alone",
            div()
                .flex()
                .items_center()
                .gap(px(16.0))
                .child(
                    StatusDot::new("recording")
                        .tone(StatusTone::Live)
                        .label("Recording")
                        .pulse(true)
                        .appearance(a),
                )
                .child(StatusDot::new("alone").tone(StatusTone::Good).appearance(a)),
        ))
        .into_any_element()
}
