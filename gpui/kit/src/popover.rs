//! Popover (`components/ui/popover.tsx`): gpui-base's Popover for the
//! behaviour (the trigger toggles it, Enter and Space too; Escape and an
//! outside press dismiss it and focus returns; the AccessKit dialog role),
//! the popup tier of the float glass: 288 px wide, the popup radius, p-3.

use gpui::{Anchor, AnyElement, App, ElementId, IntoElement, Window, div, prelude::*, px};

use crate::{
    button::Button,
    chrome,
    theme::{Appearance, hsla, resolve},
    tokens::{Theme, radius},
};

type Content = Box<dyn FnOnce(&mut Window, &mut App) -> AnyElement>;

#[derive(IntoElement)]
pub struct Popover {
    id: ElementId,
    trigger: Option<Button>,
    content: Option<Content>,
    anchor: Anchor,
    width: f32,
    appearance: Option<Appearance>,
}

impl Popover {
    pub fn new(id: impl Into<ElementId>) -> Self {
        Popover {
            id: id.into(),
            trigger: None,
            content: None,
            anchor: Anchor::TopLeft,
            width: 288.0,
            appearance: None,
        }
    }

    /// The button that opens it; it shows as expanded while open.
    pub fn trigger(mut self, trigger: Button) -> Self {
        self.trigger = Some(trigger);
        self
    }

    /// What it holds, built when it opens.
    pub fn content<E: IntoElement>(
        mut self,
        content: impl FnOnce(&mut Window, &mut App) -> E + 'static,
    ) -> Self {
        self.content = Some(Box::new(move |window, cx| {
            content(window, cx).into_any_element()
        }));
        self
    }

    /// Which corner of the popup meets the trigger; top-left by default.
    pub fn anchor(mut self, anchor: Anchor) -> Self {
        self.anchor = anchor;
        self
    }

    pub fn width(mut self, width: f32) -> Self {
        self.width = width;
        self
    }

    /// Draws in this appearance instead of the window's (the gallery).
    pub fn appearance(mut self, appearance: Appearance) -> Self {
        self.appearance = Some(appearance);
        self
    }
}

/// `glass-float`: the popup tier, flat and opaque, its rim and drop.
pub fn popup_surface(t: &Theme) -> gpui::Div {
    div()
        .border_1()
        .border_color(hsla(t.glass_float_rim))
        .bg(hsla(t.glass_float))
        .shadow(chrome::shadows(t.glass_float_drop))
        .rounded(px(radius::LG))
        .text_color(hsla(t.popover_foreground))
}

impl RenderOnce for Popover {
    fn render(self, window: &mut Window, cx: &mut App) -> impl IntoElement {
        let t = resolve(self.appearance, window, cx);
        let width = self.width;
        let content = self.content;
        let mut popover = gpui_base::Popover::new(self.id)
            .anchor(self.anchor)
            .offset(px(6.0))
            .content(move |_, window, cx| {
                popup_surface(t)
                    .id("popover-surface")
                    .occlude()
                    .w(px(width))
                    .p(px(12.0))
                    .flex()
                    .flex_col()
                    .gap(px(12.0))
                    .text_size(px(14.0))
                    .children(content.map(|content| content(window, cx)))
            });
        if let Some(trigger) = self.trigger {
            popover = popover.trigger(trigger);
        }
        popover
    }
}
