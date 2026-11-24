//! WindowFrame and WindowHeader (`components/window-frame.tsx`): the frame
//! every single-pane window shares (Stream Manager, Notes, Captions). The
//! window's solid sits under it; this adds the content coat and the header
//! row on the traffic lights' line.

use gpui::{
    AnyElement, App, IntoElement, Role, SharedString, Window, WindowControlArea, div, prelude::*,
    px,
};
use smallvec::SmallVec;

use crate::{
    theme::{Appearance, hsla, resolve},
    tokens::size,
};

/// The traffic-light gutter. The kit centres the three 14 px lights on the
/// toolbar band from 14 px in (`window::options`); they end 74 px in, so
/// 88 px leaves the title 14 px of air.
pub const TRAFFIC_LIGHT_GUTTER: f32 = 88.0;

/// A header's left padding: the gutter where the traffic lights share its
/// row (macOS), else 12 px.
pub fn header_inset(mac: bool) -> f32 {
    if mac { TRAFFIC_LIGHT_GUTTER } else { 12.0 }
}

/// The header row of a single-pane window. It sits on the traffic lights'
/// line, is the window's drag band, and carries the window's title as its
/// level-1 heading in the main window's recipe (14 px / 600). `meta` is a
/// quiet inline fact after the title; children are the window's few
/// controls, trailing, out of the drag band. Stream Manager keeps its row to
/// the title.
#[derive(IntoElement)]
pub struct WindowHeader {
    title: SharedString,
    meta: Option<AnyElement>,
    children: SmallVec<[AnyElement; 2]>,
    mac: bool,
    appearance: Option<Appearance>,
}

impl WindowHeader {
    pub fn new(title: impl Into<SharedString>) -> Self {
        WindowHeader {
            title: title.into(),
            meta: None,
            children: SmallVec::new(),
            mac: cfg!(target_os = "macos"),
            appearance: None,
        }
    }

    /// A quiet inline fact after the title (the Captions reader's state).
    pub fn meta(mut self, meta: impl IntoElement) -> Self {
        self.meta = Some(meta.into_any_element());
        self
    }

    /// Lays out for macOS (`true`, the traffic lights share the row) or for
    /// Windows and Linux, whatever this build runs on (the gallery shows
    /// both).
    pub fn mac(mut self, mac: bool) -> Self {
        self.mac = mac;
        self
    }

    /// Draws in this appearance instead of the window's (the gallery).
    pub fn appearance(mut self, appearance: Appearance) -> Self {
        self.appearance = Some(appearance);
        self
    }
}

/// The window's few controls, trailing.
impl ParentElement for WindowHeader {
    fn extend(&mut self, elements: impl IntoIterator<Item = AnyElement>) {
        self.children.extend(elements);
    }
}

impl RenderOnce for WindowHeader {
    fn render(self, window: &mut Window, cx: &mut App) -> impl IntoElement {
        let t = resolve(self.appearance, window, cx);
        let actions = (!self.children.is_empty()).then(|| {
            div()
                .ml_auto()
                .flex()
                .flex_none()
                .items_center()
                .gap(px(4.0))
                // Out of the drag band: a click here reaches the control.
                .block_mouse_except_scroll()
                .children(self.children)
        });
        div()
            .w_full()
            .h(px(size::TOOLBAR))
            .flex()
            .flex_none()
            .items_center()
            .gap(px(8.0))
            .overflow_hidden()
            .pl(px(header_inset(self.mac)))
            .pr(px(8.0))
            .border_b_1()
            .border_color(hsla(t.border))
            .window_control_area(WindowControlArea::Drag)
            .child(
                div()
                    .id("window-header-title")
                    .role(Role::Heading)
                    .aria_level(1)
                    .flex_none()
                    .min_w(px(0.))
                    .truncate()
                    .text_size(px(14.0))
                    .line_height(px(20.0))
                    .font_weight(gpui::FontWeight::SEMIBOLD)
                    .text_color(hsla(t.foreground))
                    .child(self.title),
            )
            .children(self.meta.map(|meta| {
                div()
                    .flex()
                    .min_w(px(0.))
                    .items_center()
                    .gap(px(8.0))
                    .child(meta)
            }))
            .children(actions)
    }
}

/// A single-pane window: the content coat over the window's solid, the
/// header, the body and the status bar stacked in it.
#[derive(IntoElement)]
pub struct WindowFrame {
    children: SmallVec<[AnyElement; 3]>,
    appearance: Option<Appearance>,
}

impl Default for WindowFrame {
    fn default() -> Self {
        Self::new()
    }
}

impl WindowFrame {
    pub fn new() -> Self {
        WindowFrame {
            children: SmallVec::new(),
            appearance: None,
        }
    }

    /// Draws in this appearance instead of the window's (the gallery).
    pub fn appearance(mut self, appearance: Appearance) -> Self {
        self.appearance = Some(appearance);
        self
    }
}

impl ParentElement for WindowFrame {
    fn extend(&mut self, elements: impl IntoIterator<Item = AnyElement>) {
        self.children.extend(elements);
    }
}

impl RenderOnce for WindowFrame {
    fn render(self, window: &mut Window, cx: &mut App) -> impl IntoElement {
        let t = resolve(self.appearance, window, cx);
        div()
            .size_full()
            .flex()
            .flex_col()
            .bg(hsla(t.glass_content))
            .children(self.children)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn the_title_clears_the_traffic_lights_on_macos_only() {
        assert_eq!(header_inset(true), 88.0);
        assert_eq!(header_inset(false), 12.0);
    }
}
