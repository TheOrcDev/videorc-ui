//! ContextMenu (`components/ui/context-menu.tsx`): Dropdown Menu's list at
//! the pointer on a right-click, 144 px wide at least, to the right of the
//! press and flipping left at the window's edge. The same items, labels,
//! separators, keys and dismissal as `DropdownMenu`. A right-click while it
//! is open moves it to the new point.
//!
//! It wraps the region it serves (`ContextMenu::new("stats", bar)`), which
//! keeps its own element; style the wrapper like any element.

use gpui::{
    AnyElement, App, Bounds, Div, ElementId, IntoElement, MouseButton, SharedString, Size,
    StyleRefinement, Window, div, prelude::*,
};
use gpui_base::{Align, Placement};

use crate::{
    dropdown_menu::{MenuEntry, MenuItem, MenuPlacement, MenuState, menu_popup},
    theme::{Appearance, resolve},
};

#[derive(IntoElement)]
pub struct ContextMenu {
    id: ElementId,
    base: Div,
    target: AnyElement,
    entries: Vec<MenuEntry>,
    min_width: f32,
    appearance: Option<Appearance>,
}

impl ContextMenu {
    pub fn new(id: impl Into<ElementId>, target: impl IntoElement) -> Self {
        ContextMenu {
            id: id.into(),
            base: div(),
            target: target.into_any_element(),
            entries: Vec::new(),
            min_width: 144.0,
            appearance: None,
        }
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

    /// At least this wide; 144 px by default (the stats bar's is 208).
    pub fn min_width(mut self, width: f32) -> Self {
        self.min_width = width;
        self
    }

    /// Draws in this appearance instead of the window's (the gallery).
    pub fn appearance(mut self, appearance: Appearance) -> Self {
        self.appearance = Some(appearance);
        self
    }
}

impl Styled for ContextMenu {
    fn style(&mut self) -> &mut StyleRefinement {
        self.base.style()
    }
}

impl RenderOnce for ContextMenu {
    fn render(self, window: &mut Window, cx: &mut App) -> impl IntoElement {
        let t = resolve(self.appearance, window, cx);
        let state = window.use_keyed_state(self.id.clone(), cx, |_, cx| MenuState::new(cx));
        let popup = menu_popup(
            &self.id,
            t,
            &state,
            self.entries,
            MenuPlacement {
                placement: Placement::Right,
                align: Align::Start,
                offset: 0.0,
                min_width: self.min_width,
            },
            false,
            window,
            cx,
        );
        self.base
            .id(self.id)
            .child(self.target)
            .on_mouse_down(MouseButton::Right, move |event, window, cx| {
                cx.stop_propagation();
                let at = event.position;
                state.update(cx, |s, cx| {
                    s.anchor = Bounds::new(at, Size::default());
                    s.show(None, window, cx);
                })
            })
            .children(popup)
    }
}
