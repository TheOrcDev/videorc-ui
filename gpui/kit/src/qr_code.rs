//! QrCode (`components/ui/qr-code.tsx`): dark modules on white paper in both
//! themes. Scanners need the contrast; the style guard allowlists the fixed
//! black/white ink. ECC Medium and a quiet zone of 2 modules match Electron
//! Phone Pair (`uqr` + `qrCodePath`).

use gpui::{
    App, Bounds, ElementId, IntoElement, SharedString, StyleRefinement, Window, canvas, div, fill,
    point, prelude::*, px, size,
};

use crate::{
    theme::{Appearance, hsla, resolve},
    tokens::{Color, radius},
};

/// Paper under the modules (`bg-white`). Fixed for scanners in both themes.
const PAPER: Color = 0xffff_ffff;
/// Module ink (`#000`). Fixed for scanners in both themes.
const INK: Color = 0x0000_00ff;
/// Quiet zone around the symbol, in modules (uqr's `border: 2`).
const BORDER: usize = 2;
/// Electron's `size-56` (14 rem at 16 px).
const DEFAULT_SIZE: f32 = 224.0;
/// Electron's `p-1` around the modules.
const PAD: f32 = 4.0;

/// Encoded modules as a square bit matrix (row-major, including quiet zone).
#[derive(Clone, Debug, Default)]
struct Modules {
    /// Side length in modules (including quiet zone).
    size: usize,
    /// `true` = dark. Length `size * size`.
    dark: Vec<bool>,
}

impl Modules {
    fn encode(value: &str) -> Self {
        if value.is_empty() {
            return Modules::default();
        }
        let Ok(code) =
            qrcode::QrCode::with_error_correction_level(value.as_bytes(), qrcode::EcLevel::M)
        else {
            return Modules::default();
        };
        let core = code.width();
        let size = core + BORDER * 2;
        let mut dark = vec![false; size * size];
        for y in 0..core {
            for x in 0..core {
                if code[(x, y)] == qrcode::Color::Dark {
                    dark[(y + BORDER) * size + (x + BORDER)] = true;
                }
            }
        }
        Modules { size, dark }
    }
}

#[derive(IntoElement)]
pub struct QrCode {
    id: ElementId,
    base: gpui::Div,
    value: SharedString,
    display_size: f32,
    accessibility_label: SharedString,
    appearance: Option<Appearance>,
}

impl QrCode {
    pub fn new(id: impl Into<ElementId>) -> Self {
        QrCode {
            id: id.into(),
            base: div(),
            value: SharedString::default(),
            display_size: DEFAULT_SIZE,
            accessibility_label: "QR code".into(),
            appearance: None,
        }
    }

    /// Payload to encode (pairing URL, etc.).
    pub fn value(mut self, value: impl Into<SharedString>) -> Self {
        self.value = value.into();
        self
    }

    /// Outer edge length in px (default 224, Electron's `size-56`).
    pub fn size(mut self, edge: f32) -> Self {
        self.display_size = edge;
        self
    }

    pub fn accessibility_label(mut self, label: impl Into<SharedString>) -> Self {
        self.accessibility_label = label.into();
        self
    }

    /// Draws in this appearance instead of the window's (the gallery).
    pub fn appearance(mut self, appearance: Appearance) -> Self {
        self.appearance = Some(appearance);
        self
    }
}

impl Styled for QrCode {
    fn style(&mut self) -> &mut StyleRefinement {
        self.base.style()
    }
}

fn paint_modules(window: &mut Window, bounds: Bounds<Pixels>, modules: &Modules) {
    if modules.size == 0 || bounds.size.width <= px(0.0) || bounds.size.height <= px(0.0) {
        return;
    }
    let side = modules.size as f32;
    let module_w = bounds.size.width / side;
    let module_h = bounds.size.height / side;
    let ink = hsla(INK);
    for y in 0..modules.size {
        let mut x = 0;
        while x < modules.size {
            if !modules.dark[y * modules.size + x] {
                x += 1;
                continue;
            }
            let mut run = 1;
            while x + run < modules.size && modules.dark[y * modules.size + x + run] {
                run += 1;
            }
            let rect = Bounds {
                origin: point(
                    bounds.origin.x + module_w * x as f32,
                    bounds.origin.y + module_h * y as f32,
                ),
                size: size(module_w * run as f32, module_h),
            };
            window.paint_quad(fill(rect, ink));
            x += run;
        }
    }
}

impl RenderOnce for QrCode {
    fn render(self, window: &mut Window, cx: &mut App) -> impl IntoElement {
        // Appearance is resolved so the gallery's forced theme still paints;
        // paper and ink stay fixed (scanners), not theme tokens.
        let _t = resolve(self.appearance, window, cx);
        let modules = Modules::encode(&self.value);
        let label = self.accessibility_label;
        self.base
            .id(self.id)
            .role(gpui::Role::Image)
            .aria_label(label)
            .flex_none()
            .size(px(self.display_size))
            .rounded(px(radius::ROW))
            .bg(hsla(PAPER))
            .p(px(PAD))
            .child(
                canvas(
                    |_, _, _| (),
                    move |bounds, _, window, _| {
                        paint_modules(window, bounds, &modules);
                    },
                )
                .size_full(),
            )
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn encodes_medium_ecc_with_quiet_zone() {
        let modules = Modules::encode("https://example.com/pair");
        assert!(modules.size > BORDER * 2);
        // Quiet zone is light.
        for i in 0..modules.size {
            assert!(!modules.dark[i], "top border");
            assert!(
                !modules.dark[(modules.size - 1) * modules.size + i],
                "bottom"
            );
            assert!(!modules.dark[i * modules.size], "left");
            assert!(!modules.dark[i * modules.size + modules.size - 1], "right");
        }
        assert!(modules.dark.iter().any(|&d| d), "has dark modules");
    }

    #[test]
    fn empty_value_is_blank() {
        let modules = Modules::encode("");
        assert_eq!(modules.size, 0);
        assert!(modules.dark.is_empty());
    }
}
