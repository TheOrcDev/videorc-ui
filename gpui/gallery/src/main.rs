//! The gallery: every videorc-ui GPUI item in dark, light and both Increase
//! Contrast appearances, side by side, each column on its own solid.
//!
//! In `gpui/`: `cargo run -p videorc-gallery`. `--item <name>` opens on one
//! item; `--quit-after <seconds>` closes the gallery, so a runner can check
//! that it opens. The frame around the columns follows the system's light
//! or dark. Built with `--features shots`, `--shots <dir>` saves each item's
//! page in dark and light for the docs (`shots.rs`).

mod controls;
mod frames;
mod items;
mod menus;
mod overlays;
mod rows;
#[cfg(feature = "shots")]
mod shots;

use std::time::Duration;

use gpui::{
    AnyElement, App, Bounds, Context, Entity, FontWeight, MouseButton, MouseDownEvent, Window, div,
    prelude::*, px, size,
};
use videorc_kit::{
    Appearance, FONT, Toaster, TypeScale, hsla,
    tokens::{Color, Theme, radius, size as metrics, text},
    window,
};

/// One registry item: its name in `registry-gpui.json` (the React twin's)
/// and how it draws in one appearance. The docs' GPUI tab shows the `show`
/// function's source as the item's usage, and its shots.
struct Item {
    name: &'static str,
    show: fn(Appearance, &mut Window, &mut App) -> AnyElement,
}

const ITEMS: &[Item] = &[
    Item {
        name: "theme",
        show: theme_page,
    },
    Item {
        name: "button",
        show: items::button_page,
    },
    Item {
        name: "badge",
        show: items::badge_page,
    },
    Item {
        name: "kbd",
        show: items::kbd_page,
    },
    Item {
        name: "switch",
        show: controls::switch_page,
    },
    Item {
        name: "checkbox",
        show: controls::checkbox_page,
    },
    Item {
        name: "slider",
        show: controls::slider_page,
    },
    Item {
        name: "tabs",
        show: controls::tabs_page,
    },
    Item {
        name: "toggle-group",
        show: controls::toggle_group_page,
    },
    Item {
        name: "segmented-control",
        show: controls::segmented_control_page,
    },
    Item {
        name: "input",
        show: controls::input_page,
    },
    Item {
        name: "textarea",
        show: controls::textarea_page,
    },
    Item {
        name: "select",
        show: overlays::select_page,
    },
    Item {
        name: "dialog",
        show: overlays::dialog_page,
    },
    Item {
        name: "popover",
        show: overlays::popover_page,
    },
    Item {
        name: "tooltip",
        show: overlays::tooltip_page,
    },
    Item {
        name: "hover-card",
        show: overlays::hover_card_page,
    },
    Item {
        name: "sonner",
        show: overlays::toast_page,
    },
    Item {
        name: "scroll-area",
        show: overlays::scroll_area_page,
    },
    Item {
        name: "alert",
        show: rows::alert_page,
    },
    Item {
        name: "section-label",
        show: rows::section_label_page,
    },
    Item {
        name: "list-row",
        show: rows::list_row_page,
    },
    Item {
        name: "navigable-row",
        show: rows::navigable_row_page,
    },
    Item {
        name: "panel-section",
        show: rows::panel_section_page,
    },
    Item {
        name: "empty",
        show: rows::empty_page,
    },
    Item {
        name: "settings-row",
        show: rows::settings_row_page,
    },
    Item {
        name: "spinner",
        show: rows::spinner_page,
    },
    Item {
        name: "skeleton",
        show: rows::skeleton_page,
    },
    Item {
        name: "separator",
        show: rows::separator_page,
    },
    Item {
        name: "collapsible",
        show: rows::collapsible_page,
    },
    Item {
        name: "avatar",
        show: rows::avatar_page,
    },
    Item {
        name: "chat-platform",
        show: rows::chat_platform_page,
    },
    Item {
        name: "page-tabs",
        show: controls::page_tabs_page,
    },
    Item {
        name: "window-frame",
        show: frames::window_frame_page,
    },
    Item {
        name: "status-bar",
        show: frames::status_bar_page,
    },
    Item {
        name: "status-bar-action",
        show: frames::status_bar_action_page,
    },
    Item {
        name: "status-dot",
        show: frames::status_dot_page,
    },
    Item {
        name: "pin-window-button",
        show: frames::pin_window_button_page,
    },
    Item {
        name: "dropdown-menu",
        show: menus::dropdown_menu_page,
    },
    Item {
        name: "context-menu",
        show: menus::context_menu_page,
    },
    Item {
        name: "kebab-menu",
        show: menus::kebab_menu_page,
    },
    Item {
        name: "kebab-context-menu",
        show: menus::kebab_context_menu_page,
    },
];

fn theme_page(appearance: Appearance, _: &mut Window, _: &mut App) -> AnyElement {
    theme(appearance.theme())
}

struct Gallery {
    selected: usize,
    toaster: Entity<Toaster>,
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
        let mut columns = Vec::new();
        for appearance in Appearance::ALL {
            let theme = appearance.theme();
            let page = (item.show)(appearance, window, cx);
            // An id per column, so the same control in four columns keeps
            // four states.
            columns.push(
                div()
                    .id(appearance.name())
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
                    .child(page),
            );
        }
        div()
            .relative()
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
            // The window's toasts, over everything.
            .child(self.toaster.clone())
    }
}

/// A section label: 11 px / 600 in the faintest text tier.
fn label(theme: &Theme, words: &'static str) -> impl IntoElement {
    div()
        .type_scale(text::LABEL)
        .text_color(hsla(theme.subtle))
        .child(words)
}

pub(crate) fn section(
    theme: &Theme,
    words: &'static str,
    body: impl IntoElement,
) -> impl IntoElement {
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
    let mut shots = None;
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
            "--shots" => {
                let dir = args.next().expect("--shots takes a folder");
                shots = Some(std::path::PathBuf::from(dir));
            }
            other => panic!(
                "unknown argument {other}: use --item <name>, --quit-after <seconds> or --shots <dir>"
            ),
        }
    }
    gpui_platform::application().run(move |cx: &mut App| {
        videorc_kit::init(cx);
        if let Some(dir) = shots {
            take_shots(dir, cx);
            return;
        }
        let bounds = Bounds::centered(None, size(px(1650.), px(962.)), cx);
        cx.open_window(
            window::options("videorc-ui gallery", bounds),
            move |window, cx| {
                cx.new(|cx: &mut Context<Gallery>| {
                    cx.observe_window_appearance(window, |_, _, cx| cx.notify())
                        .detach();
                    let toaster = cx.new(Toaster::new);
                    cx.set_global(overlays::GalleryToaster(toaster.clone()));
                    Gallery { selected, toaster }
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

#[cfg(feature = "shots")]
fn take_shots(dir: std::path::PathBuf, cx: &mut App) {
    shots::run(dir, cx);
}

#[cfg(not(feature = "shots"))]
fn take_shots(_: std::path::PathBuf, _: &mut App) {
    eprintln!(
        "--shots needs the shots feature: cargo run -p videorc-gallery --features shots -- --shots <dir>"
    );
    std::process::exit(2);
}
