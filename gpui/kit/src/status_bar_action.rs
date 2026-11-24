//! StatusBarAction (`components/status-bar-action.tsx`): one action in a
//! status bar, an icon, a word, or both, and optionally its shortcut.
//! `label` is the action's name: what a screen reader says, and the tooltip
//! of an icon alone. `text` is the visible word when there is room for one;
//! `hint` says more than the name, in the tooltip and as the button's
//! description. `pressed` marks a toggle that is on.

use std::rc::Rc;

use gpui::{App, ClickEvent, ElementId, IntoElement, SharedString, Window, div, prelude::*, px};

use crate::{
    shortcut_keys::{ShortcutKeys, ShortcutStyle},
    status_bar::{ClickHandler, action_chip},
    theme::{Appearance, hsla, resolve},
    tooltip::{tooltip, tooltip_with_shortcut},
};

#[derive(IntoElement)]
pub struct StatusBarAction {
    id: ElementId,
    label: SharedString,
    icon: Option<gpui::AnyElement>,
    text: Option<SharedString>,
    hint: Option<SharedString>,
    keys: Option<ShortcutKeys>,
    pressed: bool,
    disabled: bool,
    tooltip: Option<SharedString>,
    tooltip_shortcut: Option<&'static str>,
    on_click: Option<ClickHandler>,
    appearance: Option<Appearance>,
}

impl StatusBarAction {
    /// `label` is the action's name: what a screen reader says, and the
    /// tooltip of an icon alone.
    pub fn new(id: impl Into<ElementId>, label: impl Into<SharedString>) -> Self {
        StatusBarAction {
            id: id.into(),
            label: label.into(),
            icon: None,
            text: None,
            hint: None,
            keys: None,
            pressed: false,
            disabled: false,
            tooltip: None,
            tooltip_shortcut: None,
            on_click: None,
            appearance: None,
        }
    }

    /// A 14 px icon.
    pub fn icon(mut self, icon: impl IntoElement) -> Self {
        self.icon = Some(icon.into_any_element());
        self
    }

    /// The visible word, when there is room for one ("Clip", "Clear").
    pub fn text(mut self, text: impl Into<SharedString>) -> Self {
        self.text = Some(text.into());
        self
    }

    /// More than the name: the tooltip and the button's description.
    pub fn hint(mut self, hint: impl Into<SharedString>) -> Self {
        self.hint = Some(hint.into());
        self
    }

    /// The shortcut, printed in the status bar's text style.
    pub fn keys(mut self, keys: ShortcutKeys) -> Self {
        self.keys = Some(keys);
        self
    }

    /// A toggle that is on.
    pub fn pressed(mut self, pressed: bool) -> Self {
        self.pressed = pressed;
        self
    }

    pub fn disabled(mut self, disabled: bool) -> Self {
        self.disabled = disabled;
        self
    }

    /// The tooltip's words when they are neither the hint nor the whole
    /// name (the bell is named "Notifications, 2 unread"; its tooltip says
    /// "Notifications").
    pub fn tooltip(mut self, tooltip: impl Into<SharedString>) -> Self {
        self.tooltip = Some(tooltip.into());
        self
    }

    /// The shortcut the bar has no room to print, in the tooltip (GPUI
    /// keystroke syntax).
    pub fn tooltip_shortcut(mut self, shortcut: &'static str) -> Self {
        self.tooltip_shortcut = Some(shortcut);
        self
    }

    pub fn on_click(
        mut self,
        handler: impl Fn(&ClickEvent, &mut Window, &mut App) + 'static,
    ) -> Self {
        self.on_click = Some(Rc::new(handler));
        self
    }

    /// Draws in this appearance instead of the window's (the gallery).
    pub fn appearance(mut self, appearance: Appearance) -> Self {
        self.appearance = Some(appearance);
        self
    }

    /// The tooltip's words: the override, else the hint, else the name of
    /// an icon alone. A word on the button needs no tooltip.
    fn tip(&self) -> Option<SharedString> {
        self.tooltip
            .clone()
            .or_else(|| self.hint.clone())
            .or_else(|| self.text.is_none().then(|| self.label.clone()))
    }
}

impl RenderOnce for StatusBarAction {
    fn render(self, window: &mut Window, cx: &mut App) -> impl IntoElement {
        let t = resolve(self.appearance, window, cx);
        let tip = self.tip();
        let icon_alone = self.icon.is_some() && self.text.is_none();
        let shortcut = self.tooltip_shortcut;
        let on_click = self.on_click;
        action_chip(self.id, t, self.pressed)
            .disabled(self.disabled)
            .when(self.disabled, |chip| chip.opacity(0.5))
            // An icon alone needs no side bearing for a word: a 22 px chip,
            // so a full bar of them still fits.
            .when(icon_alone, |chip| chip.px(px(4.0)))
            .accessibility_label(self.label)
            .when_some(self.hint, |chip, hint| chip.aria_description(hint))
            .when_some(tip, |chip, tip| match shortcut {
                Some(shortcut) => chip.tooltip(tooltip_with_shortcut(tip, shortcut)),
                None => chip.tooltip(tooltip(tip)),
            })
            .when_some(on_click, |chip, on_click| {
                chip.on_click(move |event, window, cx| on_click(event, window, cx))
            })
            .children(self.icon)
            .children(self.keys.map(|keys| {
                // The key in the secondary tier, a step above the word.
                div()
                    .text_color(hsla(t.muted_foreground))
                    .child(keys.style(ShortcutStyle::Text))
            }))
            .children(self.text)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn the_tooltip_is_the_override_then_the_hint_then_an_icon_alones_name() {
        let action = StatusBarAction::new("bell", "Notifications, 2 unread");
        assert_eq!(action.tip().as_deref(), Some("Notifications, 2 unread"));
        let action = StatusBarAction::new("clip", "Clip").text("Clip");
        assert_eq!(action.tip(), None);
        let action = StatusBarAction::new("clip", "Clip")
            .text("Clip")
            .hint("Saves the last 30 seconds");
        assert_eq!(action.tip().as_deref(), Some("Saves the last 30 seconds"));
        let action = StatusBarAction::new("bell", "Notifications, 2 unread")
            .hint("Opens the list")
            .tooltip("Notifications");
        assert_eq!(action.tip().as_deref(), Some("Notifications"));
    }
}
