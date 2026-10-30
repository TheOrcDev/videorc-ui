# Social images

These 1200 × 630 PNGs show videorc/ui's real React components in Videorc's dark theme, one per public page. They are committed assets, so production serves them without a browser or an image renderer.

Run `pnpm og:build` to regenerate them. It starts an isolated Next development server on port 3157 (`VIDEORC_UI_SOCIAL_PORT` picks another), captures every card with Playwright's own Chromium, updates `lib/social-images.json`, removes the images the manifest no longer names, and stops the server.

- `pnpm og:build --only components-button,home` recaptures just those cards and keeps every other entry.
- `pnpm og:build --draft` writes the PNGs to a temporary folder and changes nothing, for reviewing a design.
- `pnpm og:build --verify` captures each card twice and saves nothing unless both are byte-identical.

## What a card shows

Every page has a card. A component, primitive or block page shows that item's lead demo, `<slug>-demo`, from the example registry. Hooks, concepts and the section pages borrow the demo that shows what they're about, or one of the compositions in `components/social/social-previews.tsx`. Edit `lib/social-catalog.ts` for that mapping, a preview's size, the popup a capture opens, and each preview's alt text.

The card is laid out at 800 × 420 and captured at 1.5×, so a popup that a demo portals out of the card scales with everything else. A demo that opens a popup (a menu, a select, a tooltip, a dialog) is clicked or hovered before the shot. Dialogs and toasts are moved onto the card's stage, without a backdrop over the title.

## Determinism

The capture pauses the page clock before navigation, waits for the demo, fonts and images, opens the popup, then advances the clock by exactly 1600 ms. Chromium runs with software rasterization and [deterministic rendering flags](https://github.com/GoogleChrome/chrome-launcher/blob/main/docs/chrome-flags-for-tools.md#rendering--gpu). Text uses the system face, as Videorc does, so capture on macOS to match the committed set.

Filenames carry a hash of the PNG's bytes, so a changed card gets a new URL and social networks fetch it fresh. Review the PNGs at full size and at thumbnail size, then commit the images and the manifest together.

`/social-preview/[id]` and `/api/social-cards` answer only in a dev server started with `VIDEORC_UI_SOCIAL_CAPTURE=1`. In production they are 404s, and the sitemap leaves them out.
