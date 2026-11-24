//! The gallery's pages for the row-and-section items: Alert, SectionLabel,
//! ListRow with GroupedList, NavigableRow, PanelSection, Spinner and
//! Skeleton. The
//! words are the Electron renderer's.

use gpui::{AnyElement, App, Entity, IntoElement, SharedString, Window, div, prelude::*, px};
use videorc_kit::{
    Alert, AlertVariant, Appearance, Badge, BadgeVariant, Button, ButtonSize, ButtonVariant, Empty,
    GroupedList, IconName, ListRow, NavigableRow, PanelSection, SectionLabel, SettingsGroup,
    SettingsRow, Skeleton, Spinner, Switch, hsla, icon,
};

use crate::section;

fn column(children: Vec<AnyElement>) -> impl IntoElement {
    div()
        .w_full()
        .flex()
        .flex_col()
        .gap(px(8.0))
        .children(children)
}

/// `alert`: every tone, a title alone, a title over a description, an
/// action, and an alert without its icon.
pub fn alert_page(a: Appearance, _: &mut Window, _: &mut App) -> AnyElement {
    let t = a.theme();
    let alert =
        |id: &'static str, variant: AlertVariant| Alert::new(id).variant(variant).appearance(a);
    div()
        .flex()
        .flex_col()
        .gap(px(20.0))
        .child(section(
            t,
            "Tones",
            column(vec![
                alert("default", AlertVariant::Default)
                    .title("Stopping is taking longer than expected")
                    .description(
                        "A destination isn't responding, so Videorc is finishing the stop in the background. Force stop ends it now; the last seconds may be lost.",
                    )
                    .into_any_element(),
                alert("warning", AlertVariant::Warning)
                    .title("Camera opened twice")
                    .into_any_element(),
                alert("destructive", AlertVariant::Destructive)
                    .title("Couldn't start")
                    .description(
                        div()
                            .flex()
                            .gap(px(4.0))
                            .pt(px(8.0))
                            .child(
                                Button::new("retry")
                                    .label("Retry")
                                    .variant(ButtonVariant::Ghost)
                                    .size(ButtonSize::Xs)
                                    .appearance(a),
                            )
                            .child(
                                Button::new("dismiss")
                                    .label("Dismiss")
                                    .variant(ButtonVariant::Ghost)
                                    .size(ButtonSize::Xs)
                                    .appearance(a),
                            ),
                    )
                    .into_any_element(),
                alert("success", AlertVariant::Success)
                    .title("Event created.")
                    .into_any_element(),
                alert("quiet", AlertVariant::Quiet)
                    .title("Turn on Sidekick Live to use voice commands.")
                    .into_any_element(),
            ]),
        ))
        .child(section(
            t,
            "Locked, with an action",
            alert("locked", AlertVariant::Locked)
                .title("Allow cloud AI to create an avatar.")
                .action(
                    Button::new("allow")
                        .label("Allow cloud AI")
                        .variant(ButtonVariant::Outline)
                        .size(ButtonSize::Xs)
                        .appearance(a),
                ),
        ))
        .child(section(
            t,
            "Without an icon",
            alert("plain", AlertVariant::Default)
                .no_icon()
                .title("Camera opened twice"),
        ))
        .into_any_element()
}

/// `section-label`: the name over a group.
pub fn section_label_page(a: Appearance, _: &mut Window, _: &mut App) -> AnyElement {
    let t = a.theme();
    section(
        t,
        "Labels",
        div()
            .flex()
            .flex_col()
            .gap(px(8.0))
            .child(SectionLabel::new("On the program").appearance(a))
            .child(SectionLabel::new("Livestream").appearance(a))
            .child(SectionLabel::new("What you can say").appearance(a)),
    )
    .into_any_element()
}

/// `list-row`: facts, a selected row, a compact row, rows that act, and a
/// grouped list with a label.
pub fn list_row_page(a: Appearance, _: &mut Window, _: &mut App) -> AnyElement {
    let t = a.theme();
    let glyph = |name: IconName| icon(name, 16.0, hsla(t.muted_foreground));
    div()
        .flex()
        .flex_col()
        .gap(px(20.0))
        .child(section(
            t,
            "Rows",
            column(vec![
                ListRow::new("fact", "Display 1")
                    .icon(glyph(IconName::Info))
                    .context("Screen")
                    .meta("Connected")
                    .appearance(a)
                    .into_any_element(),
                ListRow::new("selected", "Display 2")
                    .icon(glyph(IconName::Info))
                    .context("Screen")
                    .selected(true)
                    .appearance(a)
                    .into_any_element(),
                ListRow::new("compact", "Microphone")
                    .compact(true)
                    .meta("Command")
                    .appearance(a)
                    .into_any_element(),
                ListRow::new("acts", "Studio")
                    .meta("⌘1")
                    .on_click(|_, _, _| {})
                    .appearance(a)
                    .into_any_element(),
            ]),
        ))
        .child(section(
            t,
            "Grouped",
            GroupedList::new()
                .label("Destinations")
                .appearance(a)
                .row(
                    ListRow::new("youtube", "YouTube")
                        .child(
                            Badge::new("Connected")
                                .variant(BadgeVariant::Success)
                                .appearance(a),
                        )
                        .appearance(a),
                )
                .row(
                    ListRow::new("twitch", "Twitch")
                        .child(
                            Badge::new("Idle")
                                .variant(BadgeVariant::Neutral)
                                .appearance(a),
                        )
                        .appearance(a),
                )
                .row(
                    ListRow::new("kick", "Kick")
                        .child(Switch::new("kick-on").appearance(a))
                        .appearance(a),
                ),
        ))
        .into_any_element()
}

/// `navigable-row`: a fact, rows that jump to their value's home (one with a
/// hint), and a control value, flush in a grouped list.
pub fn navigable_row_page(a: Appearance, _: &mut Window, _: &mut App) -> AnyElement {
    let t = a.theme();
    let glyph = |name: IconName| icon(name, 16.0, hsla(t.muted_foreground));
    div()
        .flex()
        .flex_col()
        .gap(px(20.0))
        .child(section(
            t,
            "Alone",
            column(vec![
                NavigableRow::new("fact", "Microphone", "Microphone (HD Pro Webcam C920)")
                    .icon(glyph(IconName::Info))
                    .appearance(a)
                    .into_any_element(),
                NavigableRow::new("jumps", "Output", "1080p · 60 fps")
                    .icon(glyph(IconName::Info))
                    .on_navigate(|_, _, _| {})
                    .appearance(a)
                    .into_any_element(),
            ]),
        ))
        .child(section(
            t,
            "In a grouped list",
            GroupedList::new()
                .appearance(a)
                .row(
                    NavigableRow::new("livestream", "Livestream", "YouTube, Twitch")
                        .icon(glyph(IconName::Info))
                        .hint(["YouTube", "Twitch"])
                        .on_navigate(|_, _, _| {})
                        .appearance(a),
                )
                .row(
                    NavigableRow::new("output", "Output", "1080p · 60 fps")
                        .icon(glyph(IconName::Info))
                        .on_navigate(|_, _, _| {})
                        .appearance(a),
                )
                .row(
                    NavigableRow::with_control(
                        "agents",
                        "Agents",
                        Button::new("stop")
                            .label("Stop")
                            .variant(ButtonVariant::Outline)
                            .size(ButtonSize::Xs)
                            .appearance(a),
                    )
                    .icon(glyph(IconName::Info))
                    .appearance(a),
                ),
        ))
        .into_any_element()
}

/// `panel-section`: sections with a title, a description, an action and
/// content; a nested section; a titleless one and a header-only one.
pub fn panel_section_page(a: Appearance, _: &mut Window, _: &mut App) -> AnyElement {
    let t = a.theme();
    let words = |words: &'static str| div().text_size(px(13.0)).child(words);
    div()
        .w_full()
        .flex()
        .flex_col()
        .child(
            PanelSection::new("general")
                .title("Room")
                .description("Guests join from a link in their browser. Nothing to install.")
                .action(Switch::new("general-on").appearance(a))
                .appearance(a)
                .child(words("On the program")),
        )
        .child(
            PanelSection::new("nested")
                .title("Separate files")
                .heading_level(3)
                .icon(icon(IconName::Info, 16.0, hsla(t.muted_foreground)))
                .appearance(a)
                .child(words("Videorc Cloud can also record each person and each source as its own file, beside the show's recording.")),
        )
        .child(
            PanelSection::new("untitled")
                .appearance(a)
                .child(words("Turn on Sidekick Live to use voice commands.")),
        )
        .child(
            PanelSection::new("header-only")
                .title("Commands")
                .description("What you can say")
                .last(true)
                .appearance(a),
        )
        .into_any_element()
}

/// `skeleton`: placeholders while content loads.
/// `spinner`: alone it is a status named Loading; beside its own words it
/// is silent.
pub fn spinner_page(a: Appearance, _: &mut Window, _: &mut App) -> AnyElement {
    let t = a.theme();
    let id = |name: &str| SharedString::from(format!("{}/{name}", a.name()));
    section(
        t,
        "Work in flight",
        div()
            .flex()
            .items_center()
            .gap(px(16.0))
            .child(Spinner::new(id("spinner")).appearance(a))
            .child(
                Spinner::new(id("spinner-large"))
                    .size(24.0)
                    .color(t.muted_foreground)
                    .appearance(a),
            )
            .child(
                div()
                    .flex()
                    .items_center()
                    .gap(px(6.0))
                    .text_color(hsla(t.muted_foreground))
                    .child(
                        Spinner::new(id("spinner-words"))
                            .size(14.0)
                            .color(t.muted_foreground)
                            .hidden(true)
                            .appearance(a),
                    )
                    .child("Loading"),
            ),
    )
    .into_any_element()
}

/// `empty`: title, muted line and an action.
pub fn empty_page(a: Appearance, _: &mut Window, _: &mut App) -> AnyElement {
    let t = a.theme();
    section(
        t,
        "No recordings",
        Empty::new()
            .title("No recordings yet")
            .description("Recordings you make in the Studio show up here.")
            .appearance(a)
            .child(
                Button::new("open-studio")
                    .label("Open Studio")
                    .variant(ButtonVariant::Secondary)
                    .appearance(a),
            ),
    )
    .into_any_element()
}

/// `settings-row`: label, description and control in a grouped list.
pub fn settings_row_page(a: Appearance, window: &mut Window, cx: &mut App) -> AnyElement {
    let t = a.theme();
    let flag = |name: &str, initial: bool| {
        let key = SharedString::from(format!("{}/{name}", a.name()));
        window.use_keyed_state(key, cx, |_, _| initial)
    };
    let save: Entity<bool> = flag("settings-save", true);
    let chat: Entity<bool> = flag("settings-chat", false);
    let toggle = |state: &Entity<bool>, id: &'static str, label: &'static str, cx: &App| {
        let state = state.clone();
        Switch::new(id)
            .checked(*state.read(cx))
            .accessibility_label(label)
            .appearance(a)
            .on_change(move |next, _, cx| {
                state.update(cx, |value, cx| {
                    *value = next;
                    cx.notify();
                })
            })
    };
    section(
        t,
        "Grouped",
        SettingsGroup::new()
            .appearance(a)
            .row(
                SettingsRow::new("recordings-folder", "Recordings folder")
                    .description("~/Movies/Videorc")
                    .error("The recordings folder you chose isn't available.")
                    .accessibility_label("Recordings folder")
                    .appearance(a)
                    .child(
                        Button::new("choose-folder")
                            .label("Choose…")
                            .variant(ButtonVariant::Outline)
                            .appearance(a),
                    ),
            )
            .row(
                SettingsRow::new("save-local", "Save local recording")
                    .description("Keep a copy on this computer while you stream.")
                    .appearance(a)
                    .child(toggle(&save, "save-local", "Save local recording", cx)),
            )
            .row(
                SettingsRow::new("chat-studio", "Chat in Studio")
                    .description("Show chat under Session while you're on air.")
                    .appearance(a)
                    .child(toggle(&chat, "chat-studio", "Chat in Studio", cx)),
            ),
    )
    .into_any_element()
}

pub fn skeleton_page(a: Appearance, _: &mut Window, _: &mut App) -> AnyElement {
    let t = a.theme();
    section(
        t,
        "Loading",
        div()
            .w_full()
            .flex()
            .flex_col()
            .gap(px(8.0))
            .child(Skeleton::new("row-1").w_full().h(px(32.0)).appearance(a))
            .child(Skeleton::new("row-2").w_full().h(px(32.0)).appearance(a))
            .child(
                Skeleton::new("block")
                    .w(px(160.0))
                    .h(px(90.0))
                    .appearance(a),
            ),
    )
    .into_any_element()
}
