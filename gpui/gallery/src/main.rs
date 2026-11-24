//! The gallery: every videorc-ui GPUI item in dark, light and both Increase
//! Contrast appearances, side by side, each column on its own solid.
//!
//! In `gpui/`: `cargo run -p videorc-gallery`. `--item <name>` opens on one
//! item; `--quit-after <seconds>` closes the gallery, so a runner can check
//! that it opens. The frame around the columns follows the system's light
//! or dark.

use std::time::Duration;

use gpui::{
    AnyElement, App, Bounds, Context, FontWeight, MouseButton, MouseDownEvent, Window, div,
    prelude::*, px, size,
};
use videorc_kit::{
    Appearance, FONT, TypeScale, hsla,
    tokens::{Color, Theme, radius, size as metrics, text},
    window,
};

/// One registry item: its name (the React twin's) and how it draws in one
/// appearance. S2.2c adds the primitives here, one per videorc-ui PR.
struct Item {
    name: &'static str,
    show: fn(&Theme) -> AnyElement,
}

const ITEMS: &[Item] = &[Item {
    name: "theme",
    show: theme,
}];

struct Gallery {
    selected: usize,
}

impl Render for Gallery {
    fn render(&mut self, window: &mut Window, cx: &mut Context<Self>) -> impl IntoElement {
        let frame = Appearance::of(window.appearance(), false).theme();
        let item = &ITEMS[self.selected];
        let rows = ITEMS.iter().enumerate().map(|(index, entry)| {
            div()
                .h(px(metrics::ROW))
                .px(px(10.))
                .flex()
                .items_center()
                .rounded(px(radius::ROW))
                .text_size(px(13.))
                .font_weight(FontWeight::MEDIUM)
                .when(index == self.selected, |row| row.bg(hsla(frame.accent)))
                .on_mouse_down(
                    MouseButton::Left,
                    cx.listener(move |this, _: &MouseDownEvent, _, cx| {
                        this.selected = index;
                        cx.notify();
                    }),
                )
                .child(entry.name)
        });
        let sidebar = div()
            .w(px(208.))
            .h_full()
            .flex_none()
            .flex()
            .flex_col()
            .border_r_1()
            .border_color(hsla(frame.border))
            // The traffic lights' band.
            .child(div().h(px(metrics::TOOLBAR)).flex_none())
            .child(
                div()
                    .px(px(12.))
                    .flex()
                    .flex_col()
                    .gap(px(2.))
                    .children(rows),
            );
        let toolbar = div()
            .h(px(metrics::TOOLBAR))
            .flex_none()
            .px(px(metrics::GUTTER))
            .flex()
            .items_center()
            .border_b_1()
            .border_color(hsla(frame.border))
            .text_size(px(14.))
            .font_weight(FontWeight::SEMIBOLD)
            .child(item.name);
        let columns = Appearance::ALL.into_iter().map(|appearance| {
            let theme = appearance.theme();
            div()
                .flex_1()
                .h_full()
                .overflow_hidden()
                .p(px(metrics::GUTTER))
                .flex()
                .flex_col()
                .gap(px(16.))
                .bg(hsla(theme.glass_solid))
                .text_color(hsla(theme.foreground))
                .child(label(theme, appearance.name()))
                .child((item.show)(theme))
        });
        div()
            .size_full()
            .flex()
            .bg(hsla(frame.glass_solid))
            .text_color(hsla(frame.foreground))
            .font_family(FONT)
            .child(sidebar)
            .child(
                div()
                    .flex_1()
                    .h_full()
                    .flex()
                    .flex_col()
                    .child(toolbar)
                    .child(div().flex_1().flex().children(columns)),
            )
    }
}

/// A section label: 11 px / 600 in the faintest text tier.
fn label(theme: &Theme, words: &'static str) -> impl IntoElement {
    div()
        .type_scale(text::LABEL)
        .text_color(hsla(theme.subtle))
        .child(words)
}

fn section(theme: &Theme, words: &'static str, body: impl IntoElement) -> impl IntoElement {
    div()
        .flex()
        .flex_col()
        .gap(px(8.))
        .child(label(theme, words))
        .child(body)
}

/// A token's colour over the column's solid, with its short name.
fn swatch(theme: &Theme, name: &'static str, color: Color) -> AnyElement {
    div()
        .w(px(56.))
        .flex()
        .flex_col()
        .gap(px(4.))
        .child(
            div()
                .h(px(28.))
                .rounded(px(radius::CHIP))
                .border_1()
                .border_color(hsla(theme.border))
                .bg(hsla(color)),
        )
        .child(
            div()
                .type_scale(text::META)
                .text_color(hsla(theme.muted_foreground))
                .child(name),
        )
        .into_any_element()
}

fn swatches(theme: &Theme, colors: &[(&'static str, Color)]) -> impl IntoElement {
    div().flex().flex_wrap().gap(px(8.)).children(
        colors
            .iter()
            .map(|&(name, color)| swatch(theme, name, color)),
    )
}

/// The `theme` item: the grounds, the text tiers, the tones, the radius
/// tiers and the type scale, all from the generated tokens.
fn theme(t: &Theme) -> AnyElement {
    let corners = [
        ("panel", radius::PANEL),
        ("popup", radius::LG),
        ("row", radius::ROW),
        ("tag", radius::TAG),
        ("chip", radius::CHIP),
    ];
    let scale = [
        ("Section 13 / 600", text::SECTION),
        ("Meta 12 / 400", text::META),
        ("Label 11 / 600", text::LABEL),
    ];
    div()
        .flex()
        .flex_col()
        .gap(px(20.))
        .child(section(
            t,
            "Grounds",
            swatches(
                t,
                &[
                    ("solid", t.glass_solid),
                    ("float", t.glass_float),
                    ("dialog", t.glass_float_dialog),
                    ("tooltip", t.glass_float_tooltip),
                    ("inset", t.inset),
                    ("accent", t.accent),
                    ("pressed", t.accent_pressed),
                ],
            ),
        ))
        .child(section(
            t,
            "Text",
            div()
                .flex()
                .flex_col()
                .gap(px(4.))
                .text_size(px(13.))
                .child(div().text_color(hsla(t.foreground)).child("Primary"))
                .child(
                    div()
                        .text_color(hsla(t.muted_foreground))
                        .child("Secondary"),
                )
                .child(div().text_color(hsla(t.subtle)).child("Tertiary")),
        ))
        .child(section(
            t,
            "Tones",
            swatches(
                t,
                &[
                    ("live", t.live),
                    ("success", t.success),
                    ("warning", t.warning),
                    ("info", t.info),
                    ("member", t.member),
                    ("reward", t.reward),
                ],
            ),
        ))
        .child(section(
            t,
            "Hairlines",
            swatches(
                t,
                &[("border", t.border), ("input", t.input), ("ring", t.ring)],
            ),
        ))
        .child(section(
            t,
            "Radii",
            div()
                .flex()
                .flex_wrap()
                .gap(px(8.))
                .children(corners.into_iter().map(|(name, corner)| {
                    div()
                        .w(px(56.))
                        .h(px(40.))
                        .flex()
                        .items_center()
                        .justify_center()
                        .rounded(px(corner))
                        .border_1()
                        .border_color(hsla(t.border))
                        .bg(hsla(t.inset))
                        .type_scale(text::META)
                        .text_color(hsla(t.muted_foreground))
                        .child(name)
                })),
        ))
        .child(section(
            t,
            "Type",
            div().flex().flex_col().gap(px(4.)).children(
                scale
                    .into_iter()
                    .map(|(name, style)| div().type_scale(style).child(name)),
            ),
        ))
        .into_any_element()
}

fn main() {
    let mut selected = 0;
    let mut quit_after = None;
    let mut args = std::env::args().skip(1);
    while let Some(arg) = args.next() {
        match arg.as_str() {
            "--item" => {
                let name = args.next().expect("--item takes an item's name");
                selected = ITEMS
                    .iter()
                    .position(|item| item.name == name)
                    .unwrap_or_else(|| panic!("the gallery has no item named {name}"));
            }
            "--quit-after" => {
                let seconds = args.next().and_then(|value| value.parse::<u64>().ok());
                quit_after = Some(seconds.expect("--quit-after takes whole seconds"));
            }
            other => {
                panic!("unknown argument {other}: use --item <name> or --quit-after <seconds>")
            }
        }
    }
    gpui_platform::application().run(move |cx: &mut App| {
        let bounds = Bounds::centered(None, size(px(1650.), px(962.)), cx);
        cx.open_window(
            window::options("videorc-ui gallery", bounds),
            move |window, cx| {
                cx.new(|cx: &mut Context<Gallery>| {
                    cx.observe_window_appearance(window, |_, _, cx| cx.notify())
                        .detach();
                    Gallery { selected }
                })
            },
        )
        .expect("open the gallery window");
        cx.activate(true);
        println!("[gallery] open with {} item(s)", ITEMS.len());
        if let Some(seconds) = quit_after {
            cx.spawn(async move |cx| {
                cx.background_executor()
                    .timer(Duration::from_secs(seconds))
                    .await;
                println!("[gallery] quitting after {seconds} s");
                cx.update(|cx| cx.quit());
            })
            .detach();
        }
    });
}
