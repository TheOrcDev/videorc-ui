//! StatusBar and StatusBarHint (`components/status-bar.tsx`): the window's
//! 26 px status bar, state on the left and quiet shortcut hints on the
//! right. It replaces a footer shortcut bar; the hints stay clickable, so
//! the app is still keyboard-first, only quieter.

use std::rc::Rc;

use gpui::{
    AnyElement, App, ClickEvent, ElementId, IntoElement, SharedString, Toggled, Window, div,
    prelude::*, px,
};
use smallvec::SmallVec;

use crate::{
    chrome::focus_ring,
    shortcut_keys::{ShortcutKeys, ShortcutStyle},
    theme::{Appearance, hsla, resolve},
    tokens::{Theme, radius, size},
};

pub(crate) type ClickHandler = Rc<dyn Fn(&ClickEvent, &mut Window, &mut App)>;

/// Every clickable thing in a status bar (`STATUS_BAR_ACTION_CLASS`): 20 px,
/// 11 px tertiary text at the body's weight that brightens on hover, a
/// pressed state for a toggle. Icons are 14 px. StatusBarHint and
/// StatusBarAction share it.
pub(crate) fn action_chip(id: ElementId, t: &Theme, pressed: bool) -> gpui_base::Button {
    let ring = focus_ring(t);
    gpui_base::Button::new(id)
        .flex()
        .flex_none()
        .items_center()
        .gap(px(4.0))
        .h(px(20.0))
        .px(px(6.0))
        .rounded(px(radius::CHIP))
        .text_size(px(11.0))
        .line_height(px(16.0))
        .text_color(hsla(if pressed { t.foreground } else { t.subtle }))
        .hover(|style| style.bg(hsla(t.accent)).text_color(hsla(t.foreground)))
        .focus_visible(move |style| style.shadow(vec![ring]))
        .aria_toggled(if pressed {
            Toggled::True
        } else {
            Toggled::False
        })
}

#[derive(IntoElement)]
pub struct StatusBar {
    leading: SmallVec<[AnyElement; 2]>,
    children: SmallVec<[AnyElement; 4]>,
    appearance: Option<Appearance>,
}

impl Default for StatusBar {
    fn default() -> Self {
        Self::new()
    }
}

impl StatusBar {
    pub fn new() -> Self {
        StatusBar {
            leading: SmallVec::new(),
            children: SmallVec::new(),
            appearance: None,
        }
    }

    /// The state, on the left: the session's own words.
    pub fn leading(mut self, leading: impl IntoElement) -> Self {
        self.leading.push(leading.into_any_element());
        self
    }

    /// Draws in this appearance instead of the window's (the gallery).
    pub fn appearance(mut self, appearance: Appearance) -> Self {
        self.appearance = Some(appearance);
        self
    }
}

/// The hints and actions, on the right.
impl ParentElement for StatusBar {
    fn extend(&mut self, elements: impl IntoIterator<Item = AnyElement>) {
        self.children.extend(elements);
    }
}

impl RenderOnce for StatusBar {
    fn render(self, window: &mut Window, cx: &mut App) -> impl IntoElement {
        let t = resolve(self.appearance, window, cx);
        div()
            .w_full()
            .h(px(size::STATUS_BAR))
            .flex()
            .flex_none()
            .items_center()
            .gap(px(12.0))
            .pl(px(12.0))
            .pr(px(6.0))
            .border_t_1()
            .border_color(hsla(t.border))
            .text_size(px(11.0))
            .line_height(px(16.0))
            .text_color(hsla(t.muted_foreground))
            .child(
                div()
                    .flex()
                    .min_w(px(0.))
                    .items_center()
                    .gap(px(12.0))
                    .children(self.leading),
            )
            .child(
                div()
                    .ml_auto()
                    .flex()
                    .min_w(px(0.))
                    .items_center()
                    .children(self.children),
            )
    }
}

/// One clickable hint: the shortcut in the secondary tier, the action in
/// the tertiary. `pressed` marks a window that is open (the hint then
/// closes it).
#[derive(IntoElement)]
pub struct StatusBarHint {
    id: ElementId,
    keys: ShortcutKeys,
    label: SharedString,
    show_label: bool,
    pressed: bool,
    on_click: Option<ClickHandler>,
    appearance: Option<Appearance>,
}

impl StatusBarHint {
    /// `keys` is the shortcut, usually `ShortcutKeys::for_action`; it prints
    /// in the status bar's text style.
    pub fn new(
        id: impl Into<ElementId>,
        keys: ShortcutKeys,
        label: impl Into<SharedString>,
    ) -> Self {
        StatusBarHint {
            id: id.into(),
            keys,
            label: label.into(),
            show_label: true,
            pressed: false,
            on_click: None,
            appearance: None,
        }
    }

    /// Hides the word and keeps the key alone (a narrow window). The word
    /// stays the hint's accessible name.
    pub fn show_label(mut self, show: bool) -> Self {
        self.show_label = show;
        self
    }

    /// The window this hint opens is open (the hint then closes it).
    pub fn pressed(mut self, pressed: bool) -> Self {
        self.pressed = pressed;
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
}

impl RenderOnce for StatusBarHint {
    fn render(self, window: &mut Window, cx: &mut App) -> impl IntoElement {
        let t = resolve(self.appearance, window, cx);
        let keys = self.keys.style(ShortcutStyle::Text);
        let on_click = self.on_click;
        action_chip(self.id, t, self.pressed)
            .accessibility_label(self.label.clone())
            .when_some(on_click, |chip, on_click| {
                chip.on_click(move |event, window, cx| on_click(event, window, cx))
            })
            .child(div().text_color(hsla(t.muted_foreground)).child(keys))
            .when(self.show_label, |chip| chip.child(self.label))
    }
}
