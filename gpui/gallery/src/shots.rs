//! `--shots <dir>`: each item's page alone, dark and light, rendered to
//! `<dir>/<item>-dark.png` and `<item>-light.png` for the docs' GPUI tab.
//!
//! Built only with `--features shots`, which turns on GPUI's
//! `test-support` for `Window::render_to_image`: GPUI draws the window's
//! last frame into a texture and reads it back, so the shot is exactly the
//! scene, without the desktop around it. macOS and Windows implement it;
//! GPUI's Linux renderer does not yet, so Linux shots come from a screen
//! grab (plan 260, L5). `node scripts/gpui-shots.mjs` runs this and records
//! which sources each shot was taken from.

use std::{
    path::{Path, PathBuf},
    time::Duration,
};

use gpui::{App, AsyncApp, Bounds, Context, Window, div, point, prelude::*, px, size};
use videorc_kit::{Appearance, FONT, hsla, tokens::size as metrics, window};

use crate::ITEMS;

/// The shot's window, in points: wide enough for a dialog, tall enough for
/// the theme page.
const WIDTH: f32 = 760.;
const HEIGHT: f32 = 640.;
/// Long enough for the first frames and the chrome rasters to settle.
const SETTLE: Duration = Duration::from_millis(800);

const APPEARANCES: [(Appearance, &str); 2] =
    [(Appearance::DARK, "dark"), (Appearance::LIGHT, "light")];

/// One item's page in one appearance, on that appearance's solid.
struct Shot {
    item: usize,
    appearance: Appearance,
}

impl Render for Shot {
    fn render(&mut self, window: &mut Window, cx: &mut Context<Self>) -> impl IntoElement {
        let theme = self.appearance.theme();
        div()
            .size_full()
            .p(px(metrics::GUTTER))
            .flex()
            .flex_col()
            .bg(hsla(theme.glass_solid))
            .text_color(hsla(theme.foreground))
            .font_family(FONT)
            .child((ITEMS[self.item].show)(self.appearance, window, cx))
    }
}

/// Takes every shot one window at a time, then quits; exits 1 if any failed.
pub fn run(dir: PathBuf, cx: &mut App) {
    if let Err(error) = std::fs::create_dir_all(&dir) {
        eprintln!("[shots] cannot create {}: {error}", dir.display());
        std::process::exit(1);
    }
    cx.spawn(async move |cx| {
        let mut failed = 0;
        for (item, entry) in ITEMS.iter().enumerate() {
            for (appearance, slug) in APPEARANCES {
                let path = dir.join(format!("{}-{slug}.png", entry.name));
                match shoot(cx, item, appearance, &path).await {
                    Ok(()) => println!("[shots] {}", path.display()),
                    Err(error) => {
                        failed += 1;
                        eprintln!("[shots] {} failed: {error:#}", path.display());
                    }
                }
            }
        }
        cx.update(|cx| cx.quit());
        if failed > 0 {
            std::process::exit(1);
        }
    })
    .detach();
}

async fn shoot(
    cx: &mut AsyncApp,
    item: usize,
    appearance: Appearance,
    path: &Path,
) -> gpui::Result<()> {
    let bounds = Bounds {
        origin: point(px(0.), px(0.)),
        size: size(px(WIDTH), px(HEIGHT)),
    };
    let handle = cx.open_window(
        window::options("videorc-ui gallery shot", bounds),
        |_, cx| cx.new(|_| Shot { item, appearance }),
    )?;
    cx.background_executor().timer(SETTLE).await;
    let image = handle.update(cx, |_, window, _| window.render_to_image())??;
    image.save(path)?;
    handle.update(cx, |_, window, _| window.remove_window())?;
    Ok(())
}
