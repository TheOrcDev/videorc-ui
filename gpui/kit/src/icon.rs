//! The few icons the primitives draw themselves (`components/icons.tsx`
//! names them): Phosphor's regular weight, MIT, as SVG masks the element's
//! text colour tints. Screens bring their own icons.

use gpui::{Hsla, IntoElement, Styled, Svg, px, svg};

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum IconName {
    /// `SuccessIcon`.
    CheckCircle,
    /// `ErrorIcon`.
    XCircle,
    /// `WarningIcon`.
    Warning,
    /// `InfoIcon`.
    Info,
    /// `CloseIcon`.
    X,
    /// A select's chevron.
    CaretDown,
    /// A chosen option.
    Check,
}

impl IconName {
    fn bytes(self) -> &'static [u8] {
        match self {
            IconName::CheckCircle => include_bytes!("../icons/check-circle.svg"),
            IconName::XCircle => include_bytes!("../icons/x-circle.svg"),
            IconName::Warning => include_bytes!("../icons/warning.svg"),
            IconName::Info => include_bytes!("../icons/info.svg"),
            IconName::X => include_bytes!("../icons/x.svg"),
            IconName::CaretDown => include_bytes!("../icons/caret-down.svg"),
            IconName::Check => include_bytes!("../icons/check.svg"),
        }
    }
}

/// `name` at `size` px in `color`.
pub fn icon(name: IconName, size: f32, color: Hsla) -> Svg {
    svg()
        .data(name.bytes())
        .flex_none()
        .size(px(size))
        .text_color(color)
}

/// An icon element, for `child(...)`.
pub fn icon_element(name: IconName, size: f32, color: Hsla) -> impl IntoElement {
    icon(name, size, color)
}
