//! Dialog (`components/ui/dialog.tsx`): gpui-base's modal host for the
//! behaviour (focus trap, Escape cancels, Enter confirms, a backdrop press
//! dismisses, the AccessKit dialog role), the dialog tier of the float
//! glass: the panel radius, p-5, flat and opaque, four widths, never taller
//! than the window less 16 px on each side, the body scrolling.
//!
//! The screen holds a `DialogHandle` and opens it with
//! `handle.open(window, cx)`; focus moves into the dialog as it opens.

use gpui::{
    AnyElement, App, ElementId, FontWeight, IntoElement, ParentElement, SharedString, Window,
    WindowControlArea, div, prelude::*, px,
};
pub use gpui_base::{DialogChangeReason, DialogHandle};
use smallvec::SmallVec;

use crate::{
    chrome::{self, SCRIM},
    icon::{IconName, icon},
    theme::{Appearance, FONT, hsla, resolve},
    tokens::{radius, size},
};

/// The four widths: sm 384 px (a rename, one question), md 448 px (the
/// default: confirmations, short forms), lg 576 px (forms, pickers, setup),
/// xl 768 px (review and media).
#[derive(Clone, Copy, Debug, Default, PartialEq, Eq)]
pub enum DialogSize {
    Sm,
    #[default]
    Md,
    Lg,
    Xl,
}

impl DialogSize {
    fn width(self) -> f32 {
        match self {
            DialogSize::Sm => 384.0,
            DialogSize::Md => 448.0,
            DialogSize::Lg => 576.0,
            DialogSize::Xl => 768.0,
        }
    }
}

#[derive(IntoElement)]
pub struct Dialog {
    id: ElementId,
    handle: DialogHandle,
    title: SharedString,
    description: Option<SharedString>,
    body: SmallVec<[AnyElement; 2]>,
    footer: SmallVec<[AnyElement; 2]>,
    size: DialogSize,
    close_button: bool,
    appearance: Option<Appearance>,
}

impl Dialog {
    pub fn new(
        id: impl Into<ElementId>,
        handle: &DialogHandle,
        title: impl Into<SharedString>,
    ) -> Self {
        Dialog {
            id: id.into(),
            handle: handle.clone(),
            title: title.into(),
            description: None,
            body: SmallVec::new(),
            footer: SmallVec::new(),
            size: DialogSize::Md,
            close_button: true,
            appearance: None,
        }
    }

    pub fn description(mut self, description: impl Into<SharedString>) -> Self {
        self.description = Some(description.into());
        self
    }

    pub fn size(mut self, size: DialogSize) -> Self {
        self.size = size;
        self
    }

    /// The footer's buttons, right-aligned, the primary last.
    pub fn footer(mut self, button: impl IntoElement) -> Self {
        self.footer.push(button.into_any_element());
        self
    }

    /// Hides the close button (an AlertDialog has none).
    pub fn close_button(mut self, shown: bool) -> Self {
        self.close_button = shown;
        self
    }

    /// Draws in this appearance instead of the window's (the gallery).
    pub fn appearance(mut self, appearance: Appearance) -> Self {
        self.appearance = Some(appearance);
        self
    }
}

impl ParentElement for Dialog {
    /// The body, between the header and the footer; it scrolls.
    fn extend(&mut self, elements: impl IntoIterator<Item = AnyElement>) {
        self.body.extend(elements);
    }
}

impl RenderOnce for Dialog {
    fn render(self, window: &mut Window, cx: &mut App) -> impl IntoElement {
        let t = resolve(self.appearance, window, cx);
        // One focus handle per dialog, kept while it is rendered; focus goes
        // in when it opens.
        let focus = window
            .use_keyed_state(self.id.clone(), cx, |_, cx| cx.focus_handle())
            .read(cx)
            .clone();
        let focus_on_open = focus.clone();
        let max_height = f32::from(window.viewport_size().height) - 32.0;

        let header = div()
            .flex()
            .flex_none()
            .flex_col()
            .gap(px(6.0))
            .pr(px(if self.close_button { 28.0 } else { 0.0 }))
            .child(
                gpui_base::DialogTitle::new()
                    .text_size(px(16.0))
                    .line_height(px(16.0))
                    .font_weight(FontWeight::MEDIUM)
                    .text_color(hsla(t.foreground))
                    .child(self.title.clone()),
            )
            .children(self.description.map(|description| {
                gpui_base::DialogDescription::new()
                    .text_size(px(14.0))
                    .line_height(px(20.0))
                    .text_color(hsla(t.muted_foreground))
                    .child(description)
            }));
        let body = div()
            .id("dialog-body")
            .flex_1()
            .min_h(px(0.0))
            .overflow_y_scroll()
            .flex()
            .flex_col()
            .gap(px(12.0))
            .children(self.body);
        let footer = div()
            .flex()
            .flex_none()
            .justify_end()
            .gap(px(8.0))
            .children(self.footer);
        let close = self.close_button.then(|| {
            div().absolute().top(px(12.0)).right(px(12.0)).child(
                gpui_base::DialogClose::new().trigger(move |button| {
                    button
                        .size(px(size::CONTROL))
                        .rounded(px(radius::CHIP))
                        .hover(|style| style.bg(hsla(t.muted)))
                        .accessibility_label("Close")
                        .child(icon(IconName::X, 16.0, hsla(t.muted_foreground)))
                }),
            )
        });
        let surface = div()
            .id("dialog-surface")
            .occlude()
            .relative()
            .w(px(self.size.width()))
            .max_h(px(max_height))
            .flex()
            .flex_col()
            .gap(px(20.0))
            .p(px(20.0))
            .rounded(px(radius::PANEL))
            .border_1()
            .border_color(hsla(t.glass_float_rim))
            .bg(hsla(t.glass_float_dialog))
            .shadow(chrome::shadows(t.glass_float_dialog_drop))
            .font_family(FONT)
            .text_size(px(14.0))
            .text_color(hsla(t.popover_foreground))
            .child(header)
            .child(body)
            .child(footer)
            .children(close);

        gpui_base::Dialog::new(cx)
            .handle(self.handle)
            .focus_handle(focus)
            .on_open_change(move |open, _, window, cx| {
                if open {
                    focus_on_open.focus(window, cx);
                }
            })
            .accessibility_label(self.title)
            // The toolbar band stays the window's drag area under the scrim.
            .dismiss_below_y(px(size::TOOLBAR))
            .backdrop(
                div()
                    .size_full()
                    .bg(hsla(SCRIM))
                    .window_control_area(WindowControlArea::Drag),
            )
            .popup(surface)
    }
}
