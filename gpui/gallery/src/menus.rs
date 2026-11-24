//! The gallery's pages for menus: DropdownMenu, ContextMenu, KebabMenu and
//! KebabContextMenu. The words are the Electron renderer's (the Stream
//! Manager's highlight position and banners, the Assets tab's ⋯ menu).

use gpui::{AnyElement, App, Entity, IntoElement, SharedString, Window, div, prelude::*, px};
use videorc_kit::{
    Appearance, Button, ButtonSize, ButtonVariant, ContextMenu, DropdownMenu, KEBAB_HOST,
    KebabContextMenu, KebabMenu, KebabMenuItem, KebabReveal, Menu, MenuAlign, MenuItem,
    MenuShortcut, hsla, tokens::radius,
};

use crate::section;

const POSITIONS: [&str; 4] = ["Top left", "Top right", "Bottom left", "Bottom right"];

fn key(a: Appearance, name: &str) -> SharedString {
    SharedString::from(format!("{}/{name}", a.name()))
}

/// The page's choices: the highlight position and whether banners show.
struct Choices {
    position: usize,
    banners: bool,
}

fn choices(a: Appearance, window: &mut Window, cx: &mut App) -> Entity<Choices> {
    window.use_keyed_state(key(a, "menu-choices"), cx, |_, _| Choices {
        position: 2,
        banners: true,
    })
}

/// The Stream Manager's menu: a label, the four positions as radios, the
/// banners check, and Clear view with its shortcut.
fn stream_manager_menu(choices: &Entity<Choices>, cx: &App) -> Menu {
    let current = choices.read(cx);
    let mut menu = Menu::new().label("Show highlighted messages in");
    for (index, position) in POSITIONS.iter().enumerate() {
        let choices = choices.clone();
        menu = menu.radio(*position, current.position == index, move |_, cx| {
            choices.update(cx, |choices, cx| {
                choices.position = index;
                cx.notify();
            });
        });
    }
    let banners = choices.clone();
    menu.separator()
        .checkbox("Banners", current.banners, move |on, _, cx| {
            banners.update(cx, |choices, cx| {
                choices.banners = on;
                cx.notify();
            });
        })
        .separator()
        .item(MenuItem::new("Clear view").shortcut(MenuShortcut::Keys("cmd-k")))
}

/// The Assets tab's ⋯ items for one background.
fn asset_items() -> Vec<KebabMenuItem> {
    vec![
        KebabMenuItem::new("rename", "Rename", |_, _| {}),
        KebabMenuItem::new("replace", "Replace image…", |_, _| {}),
        KebabMenuItem::new("reveal", "Reveal in Finder", |_, _| {})
            .disabled(true)
            .disabled_reason("Only imported images have a file to reveal."),
        KebabMenuItem::new("reset-style", "Reset style to defaults", |_, _| {}),
        KebabMenuItem::new("remove", "Remove", |_, _| {}).destructive(true),
    ]
}

/// A row to hang a kebab on or to right-click.
fn asset_row(a: Appearance, label: &'static str) -> gpui::Div {
    let t = a.theme();
    div()
        .flex()
        .items_center()
        .justify_between()
        .gap(px(8.0))
        .w(px(320.0))
        .h(px(40.0))
        .px(px(12.0))
        .rounded(px(radius::CHIP))
        .border_1()
        .border_color(hsla(t.border))
        .text_size(px(14.0))
        .text_color(hsla(t.foreground))
        .child(label)
}

/// `dropdown-menu`: the Stream Manager's highlight position, with radios,
/// a check, a submenu, and an item's keys.
pub fn dropdown_menu_page(a: Appearance, window: &mut Window, cx: &mut App) -> AnyElement {
    let t = a.theme();
    let choices = choices(a, window, cx);
    let position = POSITIONS[choices.read(cx).position];
    let flat = choices.clone();
    let nested = choices.clone();
    div()
        .flex()
        .flex_col()
        .gap(px(20.0))
        .child(section(
            t,
            "Radios, a check, and keys",
            DropdownMenu::new(key(a, "highlight-menu"))
                .appearance(a)
                .align(MenuAlign::End)
                .trigger(
                    Button::new(key(a, "highlight-trigger"))
                        .label(position)
                        .variant(ButtonVariant::Outline)
                        .size(ButtonSize::Xs)
                        .accessibility_label(format!("Highlight position: {position}"))
                        .appearance(a),
                )
                .menu(move |_, cx| stream_manager_menu(&flat, cx)),
        ))
        .child(section(
            t,
            "A submenu",
            DropdownMenu::new(key(a, "options-menu"))
                .appearance(a)
                .trigger(
                    Button::new(key(a, "options-trigger"))
                        .label("Options")
                        .variant(ButtonVariant::Outline)
                        .size(ButtonSize::Xs)
                        .appearance(a),
                )
                .menu(move |_, cx| {
                    Menu::new()
                        .submenu("Highlight position", stream_manager_menu(&nested, cx))
                        .item(MenuItem::new("Open Preview").shortcut(MenuShortcut::Keys("cmd-p")))
                        .separator()
                        .item(
                            MenuItem::new("Notifications")
                                .disabled(true)
                                .disabled_reason("Videorc is reconnecting…"),
                        )
                }),
        ))
        .into_any_element()
}

/// `context-menu`: right-click the row.
pub fn context_menu_page(a: Appearance, window: &mut Window, cx: &mut App) -> AnyElement {
    let t = a.theme();
    let choices = choices(a, window, cx);
    section(
        t,
        "Right-click the row",
        ContextMenu::new(key(a, "context-menu"), asset_row(a, "Stream Manager"))
            .appearance(a)
            .menu(move |_, cx| stream_manager_menu(&choices, cx)),
    )
    .into_any_element()
}

/// `kebab-menu`: the Assets tab's ⋯, always shown, on hover, and busy.
pub fn kebab_menu_page(a: Appearance, _: &mut Window, _: &mut App) -> AnyElement {
    let t = a.theme();
    div()
        .flex()
        .flex_col()
        .gap(px(20.0))
        .child(section(
            t,
            "Always shown",
            asset_row(a, "Launch demo").child(
                KebabMenu::new(key(a, "kebab"), asset_items())
                    .label("Actions for Launch demo")
                    .appearance(a),
            ),
        ))
        .child(section(
            t,
            "Shown when the row is hovered",
            asset_row(a, "Studio backdrop").group(KEBAB_HOST).child(
                KebabMenu::new(key(a, "kebab-hover"), asset_items())
                    .label("Actions for Studio backdrop")
                    .reveal(KebabReveal::Hover)
                    .appearance(a),
            ),
        ))
        .child(section(
            t,
            "Busy",
            asset_row(a, "Night sky").child(
                KebabMenu::new(key(a, "kebab-busy"), asset_items())
                    .label("Actions for Night sky")
                    .busy(true)
                    .appearance(a),
            ),
        ))
        .into_any_element()
}

/// `kebab-context-menu`: the same items on a right-click.
pub fn kebab_context_menu_page(a: Appearance, _: &mut Window, _: &mut App) -> AnyElement {
    let t = a.theme();
    section(
        t,
        "Right-click the row, or use its ⋯",
        KebabContextMenu::new(
            key(a, "kebab-context"),
            asset_items(),
            asset_row(a, "Launch demo").child(
                KebabMenu::new(key(a, "kebab-context-trigger"), asset_items())
                    .label("Actions for Launch demo")
                    .appearance(a),
            ),
        )
        .appearance(a),
    )
    .into_any_element()
}
