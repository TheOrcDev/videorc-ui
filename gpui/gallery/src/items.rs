//! The gallery's pages, one per registry item, each drawn in one appearance.

use gpui::{AnyElement, App, IntoElement, Window, div, prelude::*, px};
use videorc_kit::{
    Appearance, Badge, BadgeVariant, Button, ButtonSize, ButtonVariant, IconName, Kbd,
    ShortcutKeys, ShortcutStyle, hsla, icon, kbd_group,
};

use crate::section;

fn row(children: Vec<AnyElement>) -> impl IntoElement {
    div()
        .flex()
        .flex_wrap()
        .items_center()
        .gap(px(8.0))
        .children(children)
}

fn button(a: Appearance, id: &'static str, label: &'static str, variant: ButtonVariant) -> Button {
    Button::new(id).label(label).variant(variant).appearance(a)
}

/// `button`: every variant, Record and Go Live, the sizes, disabled, and a
/// shortcut inside a filled button.
pub fn button_page(a: Appearance, _: &mut Window, _: &mut App) -> AnyElement {
    let t = a.theme();
    let variants = [
        ("default", "Continue", ButtonVariant::Default),
        ("solid", "Save", ButtonVariant::Solid),
        ("secondary", "Secondary", ButtonVariant::Secondary),
        ("outline", "Outline", ButtonVariant::Outline),
        ("ghost", "Ghost", ButtonVariant::Ghost),
        ("destructive", "Delete", ButtonVariant::Destructive),
        ("link", "Link", ButtonVariant::Link),
        ("chromatic", "Chromatic", ButtonVariant::Chromatic),
    ];
    div()
        .flex()
        .flex_col()
        .gap(px(20.0))
        .child(section(
            t,
            "Variants",
            row(variants
                .into_iter()
                .map(|(id, label, variant)| button(a, id, label, variant).into_any_element())
                .collect()),
        ))
        .child(section(
            t,
            "Record and Go Live",
            row(vec![
                button(a, "record", "Record", ButtonVariant::Record).into_any_element(),
                button(a, "record-lit", "Stop recording", ButtonVariant::Record)
                    .lit(true)
                    .into_any_element(),
                button(a, "go-live", "Go Live", ButtonVariant::GoLive).into_any_element(),
            ]),
        ))
        .child(section(
            t,
            "Disabled",
            row(vec![
                button(a, "default-off", "Continue", ButtonVariant::Default)
                    .disabled(true)
                    .into_any_element(),
                button(a, "record-off", "Record", ButtonVariant::Record)
                    .disabled(true)
                    .into_any_element(),
                button(a, "outline-off", "Outline", ButtonVariant::Outline)
                    .disabled(true)
                    .into_any_element(),
                button(a, "secondary-off", "Secondary", ButtonVariant::Secondary)
                    .disabled(true)
                    .into_any_element(),
            ]),
        ))
        .child(section(
            t,
            "Sizes",
            row(vec![
                button(a, "xs", "Extra small", ButtonVariant::Outline)
                    .size(ButtonSize::Xs)
                    .into_any_element(),
                button(a, "md", "Default", ButtonVariant::Outline).into_any_element(),
                button(a, "lg", "Large", ButtonVariant::Outline)
                    .size(ButtonSize::Lg)
                    .into_any_element(),
                Button::new("icon")
                    .variant(ButtonVariant::Outline)
                    .size(ButtonSize::Icon)
                    .accessibility_label("Add")
                    .appearance(a)
                    .child("+")
                    .into_any_element(),
                Button::new("icon-xs")
                    .variant(ButtonVariant::Ghost)
                    .size(ButtonSize::IconXs)
                    .accessibility_label("Add")
                    .appearance(a)
                    .child("+")
                    .into_any_element(),
            ]),
        ))
        .child(section(
            t,
            "With a shortcut",
            row(vec![
                button(a, "palette", "Search", ButtonVariant::Default)
                    .child(
                        ShortcutKeys::keystrokes("cmd-k")
                            .on_filled(t.chrome_fill_ink)
                            .appearance(a),
                    )
                    .into_any_element(),
                button(a, "palette-outline", "Search", ButtonVariant::Outline)
                    .child(ShortcutKeys::keystrokes("cmd-k").appearance(a))
                    .into_any_element(),
            ]),
        ))
        .into_any_element()
}

/// `badge`: every variant, plus a leading icon (Screen hidden).
pub fn badge_page(a: Appearance, _: &mut Window, _: &mut App) -> AnyElement {
    let t = a.theme();
    let badges = [
        ("Default", BadgeVariant::Default),
        ("9:16", BadgeVariant::Outline),
        ("Ghost", BadgeVariant::Ghost),
        ("Connected", BadgeVariant::Success),
        ("Reconnecting", BadgeVariant::Warning),
        ("Idle", BadgeVariant::Neutral),
        ("Failed", BadgeVariant::Destructive),
        ("On air", BadgeVariant::Live),
        ("On stream", BadgeVariant::Chrome),
        ("Member", BadgeVariant::Plate),
    ];
    div()
        .flex()
        .flex_col()
        .gap(px(20.0))
        .child(section(
            t,
            "Variants",
            row(badges
                .into_iter()
                .map(|(label, variant)| {
                    Badge::new(label)
                        .variant(variant)
                        .appearance(a)
                        .into_any_element()
                })
                .collect()),
        ))
        .child(section(
            t,
            "Icon",
            row(vec![
                Badge::new("Screen hidden")
                    .variant(BadgeVariant::Warning)
                    .icon(icon(IconName::EyeSlash, 12.0, hsla(t.warning)))
                    .appearance(a)
                    .into_any_element(),
                Badge::new("Arrived")
                    .variant(BadgeVariant::Outline)
                    .icon(icon(IconName::ChatCircle, 12.0, hsla(t.muted_foreground)))
                    .appearance(a)
                    .into_any_element(),
            ]),
        ))
        .into_any_element()
}

/// `kbd` and `shortcut-keys`: a key chip, a group, and shortcuts as macOS
/// and as Windows and Linux print them.
pub fn kbd_page(a: Appearance, _: &mut Window, _: &mut App) -> AnyElement {
    let t = a.theme();
    let shortcut = |source: &'static str, mac: bool| {
        ShortcutKeys::keystrokes(source)
            .mac(mac)
            .appearance(a)
            .into_any_element()
    };
    div()
        .flex()
        .flex_col()
        .gap(px(20.0))
        .child(section(
            t,
            "Keys",
            row(vec![
                Kbd::new("Esc").appearance(a).into_any_element(),
                kbd_group([
                    Kbd::new("Tab").appearance(a),
                    Kbd::new("Space").appearance(a),
                ])
                .into_any_element(),
            ]),
        ))
        .child(section(
            t,
            "macOS",
            row(vec![
                shortcut("cmd-k", true),
                shortcut("cmd-shift-j", true),
                shortcut("cmd-enter", true),
                shortcut("space", true),
            ]),
        ))
        .child(section(
            t,
            "Windows and Linux",
            row(vec![
                shortcut("ctrl-k", false),
                shortcut("ctrl-shift-j", false),
                shortcut("ctrl-enter", false),
                shortcut("backspace", false),
            ]),
        ))
        .child(section(
            t,
            "In the status bar",
            div()
                .text_size(px(12.0))
                .text_color(hsla(t.muted_foreground))
                .child(
                    ShortcutKeys::keystrokes("cmd-k")
                        .style(ShortcutStyle::Text)
                        .appearance(a),
                ),
        ))
        .into_any_element()
}
