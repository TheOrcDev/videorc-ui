//! The gallery's pages for what floats: Dialog, Popover, Tooltip, Toast,
//! Select, and the ScrollArea. A dialog, a popover and a select open over
//! the whole window, in their column's appearance. Tooltips follow the
//! window's appearance, as they do in the app.

use std::rc::Rc;

use gpui::{
    AnyElement, App, Entity, Global, IntoElement, SharedString, Window, div, prelude::*, px,
};
use videorc_kit::{
    Appearance, Button, ButtonVariant, Dialog, DialogHandle, HoverCard, Popover, ScrollArea,
    Select, StatusDot, StatusTone, ToastData, ToastKind, Toaster, hsla, toast_card,
};

use crate::section;

/// The gallery window's toaster, for the toast page's buttons.
pub struct GalleryToaster(pub Entity<Toaster>);

impl Global for GalleryToaster {}

fn key(a: Appearance, name: &str) -> SharedString {
    SharedString::from(format!("{}/{name}", a.name()))
}

fn button(a: Appearance, id: SharedString, label: &'static str, variant: ButtonVariant) -> Button {
    Button::new(id).label(label).variant(variant).appearance(a)
}

/// `dialog`: a button that opens a dialog with a description, a body and
/// the footer's two buttons.
pub fn dialog_page(a: Appearance, window: &mut Window, cx: &mut App) -> AnyElement {
    let t = a.theme();
    let handle = window
        .use_keyed_state(key(a, "dialog"), cx, |_, _| DialogHandle::new(false))
        .read(cx)
        .clone();
    let open = handle.clone();
    let cancel = handle.clone();
    let confirm = handle.clone();
    div()
        .child(section(
            t,
            "Dialog",
            button(
                a,
                key(a, "dialog-open"),
                "Rename scene",
                ButtonVariant::Outline,
            )
            .on_click(move |_, window, cx| open.open(window, cx)),
        ))
        .child(
            Dialog::new(key(a, "dialog-host"), &handle, "Rename scene")
                .description("The new name shows in the Scenes gallery and on the remote.")
                .appearance(a)
                .child(
                    div()
                        .text_color(hsla(t.muted_foreground))
                        .child("A dialog's body scrolls when it is taller than the window."),
                )
                .footer(
                    button(a, key(a, "dialog-cancel"), "Cancel", ButtonVariant::Outline)
                        .on_click(move |_, window, cx| cancel.close(window, cx)),
                )
                .footer(
                    button(a, key(a, "dialog-save"), "Rename", ButtonVariant::Default)
                        .on_click(move |_, window, cx| confirm.close(window, cx)),
                ),
        )
        .into_any_element()
}

/// `popover`: a trigger and its card.
pub fn popover_page(a: Appearance, _: &mut Window, _: &mut App) -> AnyElement {
    let t = a.theme();
    section(
        t,
        "Popover",
        Popover::new(key(a, "popover"))
            .trigger(button(
                a,
                key(a, "popover-trigger"),
                "Details",
                ButtonVariant::Outline,
            ))
            .appearance(a)
            .content(move |_, _| {
                div()
                    .flex()
                    .flex_col()
                    .gap(px(4.0))
                    .child(div().text_color(hsla(t.foreground)).child("Stream health"))
                    .child(
                        div()
                            .text_color(hsla(t.muted_foreground))
                            .child("6,000 kbps to YouTube, no dropped frames."),
                    )
            }),
    )
    .into_any_element()
}

/// `hover-card`: rest the pointer on the chat's state, as in the Stream
/// Manager's status bar.
pub fn hover_card_page(a: Appearance, _: &mut Window, _: &mut App) -> AnyElement {
    let t = a.theme();
    section(
        t,
        "Rest the pointer on it",
        HoverCard::new(key(a, "hover-card"))
            .trigger(
                StatusDot::new(key(a, "hover-card-dot"))
                    .tone(StatusTone::Good)
                    .label("Twitch Connected")
                    .appearance(a),
            )
            .width(256.0)
            .padding(8.0)
            .appearance(a)
            .content(move |_, _| {
                div()
                    .flex()
                    .flex_col()
                    .gap(px(4.0))
                    .text_size(px(12.0))
                    .child(
                        div()
                            .text_color(hsla(t.foreground))
                            .child("Twitch chat: reads and sends"),
                    )
                    .child(
                        div()
                            .text_color(hsla(t.muted_foreground))
                            .child("Follow alerts and the sub count need one more Twitch permission. Reconnect Twitch from Activity or Destinations → Setup."),
                    )
            }),
    )
    .into_any_element()
}

/// `tooltip`: hover the buttons.
pub fn tooltip_page(a: Appearance, _: &mut Window, _: &mut App) -> AnyElement {
    let t = a.theme();
    section(
        t,
        "Hover a button",
        div()
            .flex()
            .gap(px(8.0))
            .child(
                button(a, key(a, "tip"), "Record", ButtonVariant::Record)
                    .tooltip("Start recording"),
            )
            .child(
                button(a, key(a, "tip-2"), "Search", ButtonVariant::Outline)
                    .tooltip("Search Videorc"),
            ),
    )
    .into_any_element()
}

fn samples() -> Vec<(&'static str, ToastData)> {
    vec![
        (
            "plain",
            ToastData::new(ToastKind::Plain, "Copied the stream key"),
        ),
        (
            "success",
            ToastData::new(ToastKind::Success, "Recording saved")
                .description("Friday night build.mp4 is in the Library."),
        ),
        (
            "info",
            ToastData::new(ToastKind::Info, "Finish connecting in your browser"),
        ),
        (
            "warning",
            ToastData::new(
                ToastKind::Warning,
                "Renaming takeovers is locked while you're live",
            ),
        ),
        (
            "error",
            ToastData::new(ToastKind::Error, "Couldn't import the image")
                .description("The file isn't a picture Videorc can read.")
                .action("Try again", |_, _| {}),
        ),
    ]
}

/// `toast`: every kind still, in this column's appearance, and buttons that
/// show each in the window's stack.
pub fn toast_page(a: Appearance, _: &mut Window, _: &mut App) -> AnyElement {
    let t = a.theme();
    let cards = samples().into_iter().map(|(id, toast)| {
        div()
            .w(px(320.0))
            .child(toast_card(t, key(a, id), &toast, None, Some(a)))
    });
    let shows = samples().into_iter().map(|(id, toast)| {
        let toast = Rc::new(toast);
        button(
            a,
            key(a, &format!("show-{id}")),
            "Show",
            ButtonVariant::Outline,
        )
        .on_click(move |_, window, cx| {
            if let Some(toaster) = cx.try_global::<GalleryToaster>().map(|it| it.0.clone()) {
                let toast = (*toast).clone();
                toaster.update(cx, |toaster, cx| toaster.show(id, toast, window, cx));
            }
        })
    });
    div()
        .flex()
        .flex_col()
        .gap(px(20.0))
        .child(section(
            t,
            "Kinds",
            div().flex().flex_col().gap(px(8.0)).children(cards),
        ))
        .child(section(
            t,
            "In the stack (plain, success, info, warning, error)",
            div().flex().flex_wrap().gap(px(8.0)).children(shows),
        ))
        .into_any_element()
}

/// `select`: a value, a placeholder and disabled.
pub fn select_page(a: Appearance, window: &mut Window, cx: &mut App) -> AnyElement {
    let t = a.theme();
    let value = window.use_keyed_state(key(a, "select-value"), cx, |_, _| {
        Some(SharedString::from("1080p"))
    });
    let chosen = value.read(cx).clone();
    let store = value.clone();
    let quality = Select::new(key(a, "select"))
        .option("720p", "720p")
        .option("1080p", "1080p")
        .option("1440p", "1440p")
        .option("4k", "4K")
        .value(chosen)
        .width(160.0)
        .accessibility_label("Quality")
        .appearance(a)
        .on_change(move |next, _, cx| {
            store.update(cx, |value, cx| {
                *value = Some(next);
                cx.notify();
            })
        });
    div()
        .flex()
        .flex_col()
        .gap(px(20.0))
        .child(section(t, "Quality", quality))
        .child(section(
            t,
            "Placeholder",
            Select::new(key(a, "select-empty"))
                .option("mic", "MacBook Pro Microphone")
                .option("usb", "USB Audio")
                .placeholder("Choose a microphone")
                .width(220.0)
                .appearance(a),
        ))
        .child(section(
            t,
            "Disabled",
            Select::new(key(a, "select-off"))
                .option("auto", "Automatic")
                .value(Some("auto".into()))
                .disabled(true)
                .width(160.0)
                .appearance(a),
        ))
        .into_any_element()
}

/// `scroll-area`: a list taller than its pane.
pub fn scroll_area_page(a: Appearance, _: &mut Window, _: &mut App) -> AnyElement {
    let t = a.theme();
    section(
        t,
        "Scroll the list",
        div()
            .h(px(180.0))
            .w(px(240.0))
            .border_1()
            .border_color(hsla(t.border))
            .rounded(px(videorc_kit::tokens::radius::ROW))
            .child(
                ScrollArea::new(key(a, "scroll")).appearance(a).child(
                    div()
                        .flex()
                        .flex_col()
                        .p(px(8.0))
                        .children((1..=24).map(|n| {
                            div()
                                .h(px(28.0))
                                .flex()
                                .items_center()
                                .text_size(px(13.0))
                                .child(format!("Scene {n}"))
                        })),
                ),
            ),
    )
    .into_any_element()
}
