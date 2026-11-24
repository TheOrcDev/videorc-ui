//! KebabMenu (`components/kebab-menu.tsx`): the ⋯ overflow menu for an
//! item's low-frequency actions, one anatomy for every list and card. A ghost
//! icon button (Phosphor's DotsThree, bold) opens a `DropdownMenu` lined up
//! with its end. Items group by `MenuItem::group` with a hairline between
//! groups, in the order each group first appears, and the destructive items
//! last in a group of their own; `busy` swaps the dots for a spinner while an
//! item's work runs.
//!
//! `reveal_on_hover`: the trigger hides until its host row (the element with
//! `.group(KEBAB_HOST)`) is hovered, and stays while the menu is open or the
//! work runs. A press on the ⋯ or in its menu stops here, so a clickable row
//! behind it does not open too.

use gpui::{
    AnyElement, App, ElementId, IntoElement, MouseButton, SharedString, Window, div, prelude::*,
};
use gpui_base::Align;

use crate::{
    button::{Button, ButtonSize, ButtonVariant},
    dropdown_menu::{DropdownMenu, MenuEntry, MenuItem},
    icon::{IconName, icon},
    spinner::Spinner,
    theme::{Appearance, faded_over, hsla, resolve},
};

/// The group name of the row a hover-revealed kebab waits for.
pub const KEBAB_HOST: &str = "kebab-host";

/// The items in their groups: each `group` in first-appearance order (the
/// ungrouped ones form one), then the destructive items on their own.
pub fn kebab_menu_groups(items: Vec<MenuItem>) -> Vec<Vec<MenuItem>> {
    let mut groups: Vec<(Option<SharedString>, Vec<MenuItem>)> = Vec::new();
    let mut destructive = Vec::new();
    for item in items {
        if item.destructive {
            destructive.push(item);
            continue;
        }
        match groups.iter_mut().find(|(key, _)| *key == item.group) {
            Some((_, group)) => group.push(item),
            None => groups.push((item.group.clone(), vec![item])),
        }
    }
    let mut groups: Vec<Vec<MenuItem>> = groups.into_iter().map(|(_, group)| group).collect();
    if !destructive.is_empty() {
        groups.push(destructive);
    }
    groups
}

#[derive(IntoElement)]
pub struct KebabMenu {
    id: ElementId,
    items: Vec<MenuItem>,
    label: SharedString,
    busy: bool,
    disabled: bool,
    reveal_on_hover: bool,
    appearance: Option<Appearance>,
}

impl KebabMenu {
    pub fn new(id: impl Into<ElementId>) -> Self {
        KebabMenu {
            id: id.into(),
            items: Vec::new(),
            label: "More actions".into(),
            busy: false,
            disabled: false,
            reveal_on_hover: false,
            appearance: None,
        }
    }

    pub fn item(mut self, item: MenuItem) -> Self {
        self.items.push(item);
        self
    }

    /// The trigger's accessible name: "Actions for Launch demo".
    pub fn label(mut self, label: impl Into<SharedString>) -> Self {
        self.label = label.into();
        self
    }

    /// An item's work is running: a spinner replaces the dots.
    pub fn busy(mut self, busy: bool) -> Self {
        self.busy = busy;
        self
    }

    /// The whole menu is unavailable (the app is reconnecting).
    pub fn disabled(mut self, disabled: bool) -> Self {
        self.disabled = disabled;
        self
    }

    /// Hidden until the `KEBAB_HOST` row is hovered.
    pub fn reveal_on_hover(mut self, reveal: bool) -> Self {
        self.reveal_on_hover = reveal;
        self
    }

    /// Draws in this appearance instead of the window's (the gallery).
    pub fn appearance(mut self, appearance: Appearance) -> Self {
        self.appearance = Some(appearance);
        self
    }
}

impl RenderOnce for KebabMenu {
    fn render(self, window: &mut Window, cx: &mut App) -> impl IntoElement {
        let t = resolve(self.appearance, window, cx);
        let ink = if self.disabled {
            faded_over(t.foreground, t.glass_solid, 0.5)
        } else {
            t.foreground
        };
        let mut entries = Vec::new();
        for (index, group) in kebab_menu_groups(self.items).into_iter().enumerate() {
            if index > 0 {
                entries.push(MenuEntry::Separator);
            }
            entries.extend(group.into_iter().map(MenuEntry::Item));
        }
        let glyph: AnyElement = if self.busy {
            Spinner::new(SharedString::from(format!("{}/busy", self.id)))
                .hidden(true)
                .color(ink)
                .into_any_element()
        } else {
            icon(IconName::DotsThreeBold, 16.0, hsla(ink)).into_any_element()
        };
        let mut trigger = Button::new(SharedString::from(format!("{}/trigger", self.id)))
            .variant(ButtonVariant::Ghost)
            .size(ButtonSize::Icon)
            .disabled(self.disabled)
            .accessibility_label(self.label)
            .child(glyph);
        let mut menu = DropdownMenu::new(self.id)
            .align(Align::End)
            .entries(entries)
            .reveal_in(
                (self.reveal_on_hover && !self.busy).then(|| SharedString::from(KEBAB_HOST)),
            );
        if let Some(appearance) = self.appearance {
            trigger = trigger.appearance(appearance);
            menu = menu.appearance(appearance);
        }
        div()
            .flex_none()
            .on_mouse_down(MouseButton::Left, |_, _, cx| cx.stop_propagation())
            .child(menu.trigger(trigger))
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn labels(groups: &[Vec<MenuItem>]) -> Vec<Vec<&str>> {
        groups
            .iter()
            .map(|group| group.iter().map(|item| item.label.as_ref()).collect())
            .collect()
    }

    #[test]
    fn groups_keep_first_appearance_order_and_destructive_items_go_last() {
        let groups = kebab_menu_groups(vec![
            MenuItem::new("Rename"),
            MenuItem::new("Remove").destructive(true),
            MenuItem::new("Reveal in Finder").group("files"),
            MenuItem::new("Replace image…"),
            MenuItem::new("Reset style to defaults").group("files"),
        ]);
        assert_eq!(
            labels(&groups),
            vec![
                vec!["Rename", "Replace image…"],
                vec!["Reveal in Finder", "Reset style to defaults"],
                vec!["Remove"],
            ]
        );
    }

    #[test]
    fn no_destructive_items_means_no_trailing_group() {
        let groups = kebab_menu_groups(vec![MenuItem::new("Rename")]);
        assert_eq!(labels(&groups), vec![vec!["Rename"]]);
    }
}
