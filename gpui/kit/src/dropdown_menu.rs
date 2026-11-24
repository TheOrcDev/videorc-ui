//! DropdownMenu (`components/ui/dropdown-menu.tsx`): a menu of actions from a
//! button, on the popup tier of the float glass at the 10 px radius with a
//! 4 px inset, 128 px wide at least, 4 px below its trigger.
//!
//! Items are 28 px with the 6 px chip radius, concentric inside the inset;
//! the highlighted one is the accent block (a destructive one tints instead).
//! A shortcut sits right in 12 px muted words; a checkbox or radio item keeps
//! 32 px on the right for its check. A label is a 12 px muted row; a
//! separator is the hairline across the full width.
//!
//! The behaviour is Base UI's menu: the trigger's click opens it (by key, the
//! first item is highlighted too); the pointer and the arrows move the
//! highlight, looping, Home and End jump to the ends, skipping disabled
//! items; Enter, Space or a click chooses. Choosing an item closes the menu
//! and runs it; a checkbox or radio item stays open. Escape and a press
//! outside close it, and focus returns where it was. The wheel stops at the
//! menu. It fades and grows in and out in 100 ms (`motion.rs`).

use std::rc::Rc;

use gpui::{
    AnyElement, App, Bounds, Context, Div, ElementId, Entity, FocusHandle, IntoElement, KeyBinding,
    MouseDownEvent, Pixels, Role, SharedString, Stateful, Svg, Window, deferred, div, prelude::*,
    px,
};
pub use gpui_base::Align;
use gpui_base::{
    DeferredPopover, ElementExt, GlobalState, POPUP_PRIORITY, Placement, Positioner,
    Selectable as _,
    actions::{Cancel, Confirm, SelectDown, SelectFirst, SelectLast, SelectUp},
};

use crate::{
    button::Button,
    icon::{IconName, icon},
    motion::{floating, presence},
    popover::popup_glass,
    shortcut_keys::{ShortcutKeys, ShortcutStyle},
    theme::{Appearance, FONT, hsla, is_dark, resolve, with_alpha},
    tokens::{Theme, radius},
    tooltip::tooltip,
};

/// The key context of an open menu's list.
pub(crate) const CONTEXT: &str = "Menu";

/// The arrows, Home, End, Enter, Space and Escape inside an open menu.
pub(crate) fn init(cx: &mut App) {
    cx.bind_keys([
        KeyBinding::new("up", SelectUp, Some(CONTEXT)),
        KeyBinding::new("down", SelectDown, Some(CONTEXT)),
        KeyBinding::new("home", SelectFirst, Some(CONTEXT)),
        KeyBinding::new("end", SelectLast, Some(CONTEXT)),
        KeyBinding::new("enter", Confirm { secondary: false }, Some(CONTEXT)),
        KeyBinding::new("space", Confirm { secondary: false }, Some(CONTEXT)),
        KeyBinding::new("escape", Cancel, Some(CONTEXT)),
    ]);
}

type SelectHandler = Rc<dyn Fn(&mut Window, &mut App)>;
type Choose = Rc<dyn Fn(usize, &mut Window, &mut App)>;

/// One action in a menu.
pub struct MenuItem {
    pub(crate) label: SharedString,
    pub(crate) icon: Option<Svg>,
    pub(crate) shortcut: Option<ShortcutKeys>,
    pub(crate) destructive: bool,
    pub(crate) disabled: bool,
    pub(crate) disabled_reason: Option<SharedString>,
    pub(crate) checked: Option<bool>,
    pub(crate) group: Option<SharedString>,
    pub(crate) on_select: Option<SelectHandler>,
}

impl MenuItem {
    pub fn new(label: impl Into<SharedString>) -> Self {
        MenuItem {
            label: label.into(),
            icon: None,
            shortcut: None,
            destructive: false,
            disabled: false,
            disabled_reason: None,
            checked: None,
            group: None,
            on_select: None,
        }
    }

    /// A 16 px icon before the words, in the item's colour.
    pub fn icon(mut self, icon: Svg) -> Self {
        self.icon = Some(icon);
        self
    }

    /// The item's keys, right-aligned in muted words.
    pub fn shortcut(mut self, keys: ShortcutKeys) -> Self {
        self.shortcut = Some(keys);
        self
    }

    /// In the destructive tone.
    pub fn destructive(mut self, destructive: bool) -> Self {
        self.destructive = destructive;
        self
    }

    pub fn disabled(mut self, disabled: bool) -> Self {
        self.disabled = disabled;
        self
    }

    /// Why a disabled item is off, on hover: one sentence.
    pub fn disabled_reason(mut self, reason: impl Into<SharedString>) -> Self {
        self.disabled_reason = Some(reason.into());
        self
    }

    /// A checkbox or radio item: a check on the right when `checked`, and
    /// choosing it leaves the menu open.
    pub fn checked(mut self, checked: bool) -> Self {
        self.checked = Some(checked);
        self
    }

    /// For a kebab menu: items with the same group sit together.
    pub fn group(mut self, group: impl Into<SharedString>) -> Self {
        self.group = Some(group.into());
        self
    }

    /// Runs when the item is chosen, by click or by key.
    pub fn on_select(mut self, handler: impl Fn(&mut Window, &mut App) + 'static) -> Self {
        self.on_select = Some(Rc::new(handler));
        self
    }
}

/// A row in a menu.
pub enum MenuEntry {
    Item(MenuItem),
    /// Muted words heading the items after it.
    Label(SharedString),
    /// The hairline between groups.
    Separator,
}

/// The entries a pointer or a key can highlight: the enabled items.
fn enabled_items(entries: &[MenuEntry]) -> Vec<usize> {
    entries
        .iter()
        .enumerate()
        .filter_map(|(index, entry)| {
            matches!(entry, MenuEntry::Item(item) if !item.disabled).then_some(index)
        })
        .collect()
}

/// The enabled item `delta` steps from `from`, looping at the ends. From
/// nothing, down takes the first and up the last.
pub(crate) fn next_item(enabled: &[usize], from: Option<usize>, delta: isize) -> Option<usize> {
    if enabled.is_empty() {
        return None;
    }
    let count = enabled.len() as isize;
    let at = from.and_then(|from| enabled.iter().position(|&index| index == from));
    let next = match at {
        Some(at) => (at as isize + delta).rem_euclid(count),
        None if delta > 0 => 0,
        None => count - 1,
    };
    Some(enabled[next as usize])
}

/// What a menu keeps between frames: open or not, the highlighted entry,
/// what it opens from (its trigger, or the pressed point), the list's focus
/// and the focus to give back, and its claim on the window's popups.
pub(crate) struct MenuState {
    pub(crate) open: bool,
    highlighted: Option<usize>,
    pub(crate) anchor: Bounds<Pixels>,
    focus: FocusHandle,
    previous: Option<FocusHandle>,
    popup: Option<DeferredPopover>,
}

impl MenuState {
    pub(crate) fn new(cx: &mut App) -> Self {
        MenuState {
            open: false,
            highlighted: None,
            anchor: Bounds::default(),
            focus: cx.focus_handle(),
            previous: None,
            popup: None,
        }
    }

    /// Opens it (again, at a new anchor, if it is open) with `highlighted`.
    pub(crate) fn show(
        &mut self,
        highlighted: Option<usize>,
        window: &mut Window,
        cx: &mut Context<Self>,
    ) {
        if !self.open {
            self.previous = window.focused(cx);
            self.popup = Some(GlobalState::register_deferred_popover(cx));
        }
        self.open = true;
        self.highlighted = highlighted;
        self.focus.focus(window, cx);
        cx.notify();
    }

    /// Closes it; focus returns where it was if it was in the menu.
    pub(crate) fn dismiss(&mut self, window: &mut Window, cx: &mut Context<Self>) {
        if !self.open {
            return;
        }
        let had_focus = self.focus.contains_focused(window, cx);
        self.open = false;
        self.highlighted = None;
        self.popup = None;
        if had_focus {
            match self.previous.take() {
                Some(previous) => previous.focus(window, cx),
                None => window.blur(cx),
            }
        }
        cx.notify();
    }
}

/// Where the list stands against its anchor, and how narrow it may be.
pub(crate) struct MenuPlacement {
    pub(crate) placement: Placement,
    pub(crate) align: Align,
    pub(crate) offset: f32,
    pub(crate) min_width: f32,
}

fn item_row(
    t: &'static Theme,
    index: usize,
    item: MenuItem,
    highlighted: bool,
    open: bool,
    state: &Entity<MenuState>,
    choose: &Choose,
) -> Stateful<Div> {
    let lit = highlighted && !item.disabled;
    let ink = if item.destructive {
        t.destructive
    } else if lit {
        t.accent_foreground
    } else {
        t.popover_foreground
    };
    let fill = lit.then(|| {
        if item.destructive {
            with_alpha(t.destructive, if is_dark(t) { 0.2 } else { 0.1 })
        } else {
            t.accent
        }
    });
    let keys_ink = if lit {
        t.accent_foreground
    } else {
        t.muted_foreground
    };
    let row = div()
        .id(index)
        .role(Role::MenuItem)
        .relative()
        .flex()
        .items_center()
        .gap(px(8.0))
        .min_h(px(28.0))
        .py(px(4.0))
        .pl(px(8.0))
        .pr(px(if item.checked.is_some() { 32.0 } else { 8.0 }))
        .rounded(px(radius::CHIP))
        .whitespace_nowrap()
        .text_color(hsla(ink))
        .when_some(fill, |row, fill| row.bg(hsla(fill)))
        .when_some(item.icon, |row, glyph| {
            row.child(glyph.flex_none().size(px(16.0)).text_color(hsla(ink)))
        })
        .child(item.label)
        .when_some(item.shortcut, |row, keys| {
            row.child(
                div()
                    .ml_auto()
                    .text_size(px(12.0))
                    .text_color(hsla(keys_ink))
                    .child(keys.style(ShortcutStyle::Text)),
            )
        })
        .when(item.checked == Some(true), |row| {
            row.child(
                div()
                    .absolute()
                    .right(px(8.0))
                    .child(icon(IconName::Check, 16.0, hsla(ink))),
            )
        });
    if item.disabled {
        return row
            .opacity(0.5)
            .when_some(item.disabled_reason, |row, reason| {
                row.tooltip(tooltip(reason))
            });
    }
    let hover = state.clone();
    let choose = choose.clone();
    row.on_hover(move |hovered, _, cx| {
        hover.update(cx, |s, cx| {
            if *hovered {
                s.highlighted = Some(index);
            } else if s.highlighted == Some(index) {
                s.highlighted = None;
            }
            cx.notify();
        })
    })
    .on_click(move |_, window, cx| {
        // A fading copy takes no input.
        if open {
            choose(index, window, cx);
        }
    })
}

/// The open list, drawn while open and for the 100 ms fade out after. A
/// press inside the anchor is left to the trigger when `trigger_owns_anchor`.
#[allow(clippy::too_many_arguments)]
pub(crate) fn menu_popup(
    id: &ElementId,
    t: &'static Theme,
    state: &Entity<MenuState>,
    entries: Vec<MenuEntry>,
    at: MenuPlacement,
    trigger_owns_anchor: bool,
    window: &mut Window,
    cx: &mut App,
) -> Option<AnyElement> {
    let (open, highlighted, anchor, focus) = {
        let s = state.read(cx);
        (s.open, s.highlighted, s.anchor, s.focus.clone())
    };
    let sample = presence(SharedString::from(format!("{id}/motion")), open, window, cx);
    if !sample.should_render() {
        return None;
    }

    let enabled = Rc::new(enabled_items(&entries));
    // Each entry's handler, and whether choosing it closes the menu.
    let picks = Rc::new(
        entries
            .iter()
            .map(|entry| match entry {
                MenuEntry::Item(item) => (item.on_select.clone(), item.checked.is_none()),
                _ => (None, false),
            })
            .collect(),
    );
    let choose: Choose = {
        let state = state.clone();
        Rc::new(move |index: usize, window: &mut Window, cx: &mut App| {
            let Some((handler, closes)) = picks.get(index).cloned() else {
                return;
            };
            if closes {
                state.update(cx, |s, cx| s.dismiss(window, cx));
            }
            if let Some(handler) = handler {
                handler(window, cx);
            }
        })
    };

    let mut rows: Vec<AnyElement> = Vec::with_capacity(entries.len());
    for (index, entry) in entries.into_iter().enumerate() {
        rows.push(match entry {
            MenuEntry::Item(item) => item_row(
                t,
                index,
                item,
                highlighted == Some(index),
                open,
                state,
                &choose,
            )
            .into_any_element(),
            MenuEntry::Label(words) => div()
                .px(px(8.0))
                .py(px(4.0))
                .text_size(px(12.0))
                .line_height(px(16.0))
                .text_color(hsla(t.muted_foreground))
                .child(words)
                .into_any_element(),
            MenuEntry::Separator => div()
                .h(px(1.0))
                .mx(px(-4.0))
                .my(px(4.0))
                .bg(hsla(t.border))
                .into_any_element(),
        });
    }

    let step = |delta: isize| {
        let state = state.clone();
        let enabled = enabled.clone();
        move |cx: &mut App| {
            state.update(cx, |s, cx| {
                s.highlighted = next_item(&enabled, s.highlighted, delta);
                cx.notify();
            })
        }
    };
    let edge = |last: bool| {
        let state = state.clone();
        let enabled = enabled.clone();
        move |cx: &mut App| {
            state.update(cx, |s, cx| {
                s.highlighted = if last {
                    enabled.last().copied()
                } else {
                    enabled.first().copied()
                };
                cx.notify();
            })
        }
    };
    let (down, up, first, last) = (step(1), step(-1), edge(false), edge(true));
    let confirm = {
        let state = state.clone();
        move |window: &mut Window, cx: &mut App| {
            if let Some(index) = state.read(cx).highlighted {
                choose(index, window, cx);
            }
        }
    };
    let cancel = state.clone();
    let outside = state.clone();

    let list = floating(
        popup_glass(t),
        sample.progress,
        div().flex().flex_col().children(rows),
    )
    .id("menu-content")
    .role(Role::Menu)
    .occlude()
    .track_focus(&focus)
    .key_context(CONTEXT)
    .min_w(px(at.min_width))
    .p(px(4.0))
    .font_family(FONT)
    .text_size(px(14.0))
    .text_color(hsla(t.popover_foreground))
    .on_action(move |_: &SelectDown, _, cx| down(cx))
    .on_action(move |_: &SelectUp, _, cx| up(cx))
    .on_action(move |_: &SelectFirst, _, cx| first(cx))
    .on_action(move |_: &SelectLast, _, cx| last(cx))
    .on_action(move |_: &Confirm, window, cx| confirm(window, cx))
    .on_action(move |_: &Cancel, window, cx| cancel.update(cx, |s, cx| s.dismiss(window, cx)))
    .on_scroll_wheel(|_, _, cx| cx.stop_propagation())
    .on_mouse_down_out(move |event: &MouseDownEvent, window, cx| {
        // Only while open: a fading copy takes no input. The trigger's own
        // click closes it.
        if !open || (trigger_owns_anchor && anchor.contains(&event.position)) {
            return;
        }
        outside.update(cx, |s, cx| s.dismiss(window, cx));
    });

    Some(
        deferred(
            Positioner::side(anchor)
                .placement(at.placement)
                .align(at.align)
                .offset(px(at.offset))
                .margin(px(8.0))
                .child(list),
        )
        .with_priority(POPUP_PRIORITY)
        .into_any_element(),
    )
}

#[derive(IntoElement)]
pub struct DropdownMenu {
    id: ElementId,
    trigger: Option<Button>,
    entries: Vec<MenuEntry>,
    align: Align,
    min_width: f32,
    reveal_in: Option<SharedString>,
    appearance: Option<Appearance>,
}

impl DropdownMenu {
    pub fn new(id: impl Into<ElementId>) -> Self {
        DropdownMenu {
            id: id.into(),
            trigger: None,
            entries: Vec::new(),
            align: Align::Start,
            min_width: 128.0,
            reveal_in: None,
            appearance: None,
        }
    }

    /// The button that opens it; it shows as expanded while open. The menu
    /// takes the button's click.
    pub fn trigger(mut self, trigger: Button) -> Self {
        self.trigger = Some(trigger);
        self
    }

    pub fn item(mut self, item: MenuItem) -> Self {
        self.entries.push(MenuEntry::Item(item));
        self
    }

    pub fn label(mut self, words: impl Into<SharedString>) -> Self {
        self.entries.push(MenuEntry::Label(words.into()));
        self
    }

    pub fn separator(mut self) -> Self {
        self.entries.push(MenuEntry::Separator);
        self
    }

    pub fn entries(mut self, entries: impl IntoIterator<Item = MenuEntry>) -> Self {
        self.entries.extend(entries);
        self
    }

    /// Which edge of the trigger the list lines up with; the start by default.
    pub fn align(mut self, align: Align) -> Self {
        self.align = align;
        self
    }

    /// At least this wide; 128 px by default.
    pub fn min_width(mut self, width: f32) -> Self {
        self.min_width = width;
        self
    }

    /// The trigger hides until the element in `group` is hovered, and stays
    /// while the menu is open (a kebab's `reveal="hover"`).
    pub(crate) fn reveal_in(mut self, group: Option<SharedString>) -> Self {
        self.reveal_in = group;
        self
    }

    /// Draws in this appearance instead of the window's (the gallery).
    pub fn appearance(mut self, appearance: Appearance) -> Self {
        self.appearance = Some(appearance);
        self
    }
}

impl RenderOnce for DropdownMenu {
    fn render(self, window: &mut Window, cx: &mut App) -> impl IntoElement {
        let t = resolve(self.appearance, window, cx);
        let state = window.use_keyed_state(self.id.clone(), cx, |_, cx| MenuState::new(cx));
        let open = state.read(cx).open;
        let first = enabled_items(&self.entries).first().copied();
        let popup = menu_popup(
            &self.id,
            t,
            &state,
            self.entries,
            MenuPlacement {
                placement: Placement::Bottom,
                align: self.align,
                offset: 4.0,
                min_width: self.min_width,
            },
            true,
            window,
            cx,
        );
        let trigger = self.trigger.map(|trigger| {
            let state = state.clone();
            trigger.selected(open).on_click(move |event, window, cx| {
                // By key, the first item is highlighted as it opens.
                let highlighted = if event.is_keyboard() { first } else { None };
                state.update(cx, |s, cx| {
                    if s.open {
                        s.dismiss(window, cx);
                    } else {
                        s.show(highlighted, window, cx);
                    }
                })
            })
        });
        let measure = state.clone();
        div()
            .flex_none()
            .relative()
            .children(trigger)
            .when_some(self.reveal_in.filter(|_| !open), |host, group| {
                host.opacity(0.0)
                    .group_hover(group, |style| style.opacity(1.0))
            })
            .children(popup)
            .on_prepaint(move |bounds, _, cx| measure.update(cx, |s, _| s.anchor = bounds))
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn the_arrows_loop_over_the_enabled_items() {
        let enabled = [1, 2, 4];
        assert_eq!(next_item(&enabled, None, 1), Some(1));
        assert_eq!(next_item(&enabled, None, -1), Some(4));
        assert_eq!(next_item(&enabled, Some(2), 1), Some(4));
        assert_eq!(next_item(&enabled, Some(4), 1), Some(1));
        assert_eq!(next_item(&enabled, Some(1), -1), Some(4));
        assert_eq!(next_item(&[], None, 1), None);
    }

    #[test]
    fn labels_separators_and_disabled_items_take_no_highlight() {
        let entries = vec![
            MenuEntry::Label("Stats".into()),
            MenuEntry::Item(MenuItem::new("Viewers")),
            MenuEntry::Separator,
            MenuEntry::Item(MenuItem::new("Move Viewers left").disabled(true)),
            MenuEntry::Item(MenuItem::new("Reset stats")),
        ];
        assert_eq!(enabled_items(&entries), vec![1, 4]);
    }
}
