# 001 — videorc-ui: Videorc's component library

Status: planned, 2026-10-30. Nothing implemented yet.

## Goal

Move Videorc's UI components out of the desktop app into this repo. The repo is a public shadcn registry (`@videorc`) with a Fumadocs docs site and an audiocn-style landing page. Once a component lives here, it is edited here and pulled into Videorc with the shadcn CLI. Videorc stops being the place where its own design system changes.

## Decisions

Locked with the owner on 2026-10-30:

| Decision | Choice |
| --- | --- |
| Primitive base | **Base UI.** Every Radix component is ported, and Videorc migrates off Radix as it adopts the library. |
| audiocn components | **Fork the ones Videorc changed** (Liquid Chrome restyle), as `@videorc/<name>`, with attribution. Unchanged ones stay `@audiocn/<name>` dependencies. |
| Visibility and licence | **Public, MIT.** Registry and docs at `https://ui.videorc.com`, namespace `@videorc`. |
| v1 scope | **Foundation and primitives.** Theme, icons, the customised shadcn `ui/*`, Videorc's own `ui/*`, and the shared primitives. Product blocks come in a later phase. |

Derived from those choices. Each is reversible; flag one if it's wrong:

- **Style `base-rhea`, base colour stone, Phosphor icons.** Videorc's classes come from rhea, so the base flavour of the same style keeps the class diff smallest. This means re-initialising the repo, which is currently `base-luma` / olive / Remix icons.
- **One Next.js app, no monorepo**, the same as audiocn. The docs site, the registry source and the component source are one app.
- **Sources sit at their consumer paths** (`components/ui/`, `components/`, `hooks/`, `lib/`). Imports read the same here and in Videorc, and the CLI's alias rewriting is the only transform.
- **Icons stay on Phosphor in the registry.** Nucleo's licence forbids redistribution, so a Nucleo swap can only ever happen inside Videorc (see [Icons](#icons)).
- **The extraction source is Videorc `origin/main`, not the local checkout.** `~/projects/videorc` is on `feat/windows-owner-waiver`, 744 commits behind `origin/main` (439a6744, 2026-10-30). Each slice records the Videorc SHA it extracted from.

## What exists today

- **videorc-ui:** a bare Next 16.4.3 shadcn app (`base-luma`, olive, Remix icons), with Ultracite 8.1 (oxlint and oxfmt), husky, and one `button`. There is no Fumadocs, registry, tests or plans yet (this file is the first).
- **Videorc (origin/main):** an Electron, Vite and React 19 renderer at `apps/desktop/src/renderer/src`. `components.json` is `radix-rhea`, stone, Phosphor, `rsc: false`, and it already lists `@audiocn` as a registry.
  - `components/ui/` holds 55 non-test files: stock and customised shadcn, Videorc-authored primitives, and audiocn forks.
  - `components/` holds about 100 more, plus folders.
  - `styles.css` is 1,055 lines: tokens, about 20 `@utility` classes (`glass-*`, `chrome-*`, `tone-*`), and a `win32` custom variant.
  - The design language is in `.claude/skills/videorc-design/SKILL.md` (v2, "the window family", Liquid Chrome). Its **Primitives** and **shadcn component mapping** sections are effectively the v1 catalogue.
- **audiocn:** the template for everything here. See [What we copy from audiocn](#what-we-copy-from-audiocn).

## Architecture

```txt
videorc-ui/
  app/
    (home)/            landing page (audiocn-style)
    docs/              Fumadocs layout + [[...slug]] page
    llms.txt/  llms-full.txt/  llms.mdx/[[...slug]]/
    api/search/        Fumadocs search route
    globals.css        tailwind → tw-animate → shadcn/tailwind.css → fumadocs shadcn + preset → Videorc theme
  components/
    ui/                registry: shadcn (Base UI ports), Videorc ui, audiocn forks
    *.tsx              registry: Videorc primitives (list-row, panel-section, kebab-menu, …)
    examples/          one default-export demo per file, referenced by name from MDX
    docs/              site-only: component-preview, component-source, install-command, page-actions, …
    home/              site-only: landing tiles
  hooks/  lib/         registry hooks and libs + site-only lib/docs/*
  content/docs/        MDX: index, installation, concepts/, components/, primitives/, (later) blocks/
  registry.json        hand-written source registry
  public/r/            shadcn build output (gitignored, built on deploy)
  scripts/             build-examples, test-install, sync helpers
  plans/
```

### Registry rules

These follow audiocn's `plans/002-conventions.md`, adapted for Videorc.

- The item name is kebab-case, equals the file name, and equals the docs slug. A test enforces the last part.
- Types: `registry:style` or `registry:theme` for the theme, `registry:lib`, `registry:hook`, `registry:ui`, `registry:component` for primitives, and later `registry:block`.
- `registryDependencies` uses `@videorc/<name>` for our items, `@audiocn/<name>` for upstream audiocn items, and bare names only for stock shadcn items we don't customise. `cn` is our own `@videorc/utils` (clsx and tailwind-merge, taught the theme's sizes, type tokens and radius tiers), never the stock `utils`.
  - Every customised shadcn component is **our** item (`@videorc/button`), even though it installs to `components/ui/button.tsx`.
- Every UI item depends on `@videorc/theme`, so installing anything brings the tokens.
- Components import only through the standard aliases (`@/components/ui/*`, `@/components/*`, `@/lib/*`, `@/hooks/*`).
  - No `next/*` imports in registry code. Videorc is Vite and Electron.
  - No `window.videorc` calls. The app passes Electron state in through props.
- `"use client"` stays in sources. The CLI keeps it even for `rsc: false` consumers (found while building `test-install`), and Vite ignores the directive, as Videorc's own files already show.

### Theme item

`@videorc/theme` carries:

- the light and dark tokens from Videorc's `styles.css`: the translucent surfaces, the three text tiers (`--subtle`), `--live`, `--success`, `--warning`, `--info`, the radius tiers (`rounded-panel`, `rounded-row`, `rounded-chip`), and the shadows;
- the `@utility` classes (`glass-chip*`, `glass-float*`, `glass-dot`, `glass-keycap`, `chrome-*`, `tone-*`);
- the base layer (focus ring, scrollbars, reduced motion, typing-dot keyframes).

**Spike, first thing in Phase 1:** can a registry item's `css` field carry `@utility` and `@custom-variant` blocks through `shadcn add`?

- **If yes:** use one item with `cssVars` and `css`.
- **If no, or if merging about 700 lines into a consumer's CSS is unreliable:** ship the theme as a `registry:file` stylesheet (`styles/videorc.css`, with a target) that the consumer `@import`s once. Videorc is the main consumer, and one imported file is easier to keep in sync than CLI-merged CSS.

The consumer must also import `shadcn/tailwind.css`. Base UI emits the `data-open`, `data-checked` and `data-active` attributes those variants match. Videorc never imported that file, so its menu and dialog animations and active tab styles have been silently dead under Radix. The port fixes that.

### Icons

`@videorc/icons` installs `components/icons.tsx`: the semantic registry (`SourcesIcon`, `AlertIcon`, `RecordIcon`, and so on) over Phosphor, with `AppIcon` declared structurally. Every registry component imports icons from `@/components/icons` and never from a package, as Videorc's ESLint rule already requires.

The export names are the contract. Videorc may swap glyphs locally (for example to Nucleo) and stop syncing this one item. Its typecheck then catches any slot a newer component needs.

### Previews and the docs look

Videorc's surfaces are translucent and expect the Liquid Chrome ground underneath. Every `ComponentPreview` renders inside a `PreviewGround`, the `ChromeGround` paint without Electron. The site itself uses the Videorc tokens, dark by default, with a light toggle and the `d` hotkey. There are no colour-theme swatches: Videorc has one palette. The landing page's swatch row becomes Dark / Light.

### What we copy from audiocn

Copy these, then adapt names and URLs through `lib/site.ts`:

- **Fumadocs core:** `source.config.ts` (processed markdown with `output: "function"`, the custom install remark plugin), `lib/source.ts`, `app/docs/*`, `lib/layout.shared.tsx`, `mdx-components.tsx`, the globals.css import order, and `RootProvider` with its theme off (next-themes owns the theme).
- **Docs components:**
  - previews and source: `component-preview`, `component-preview-tabs`, `component-source`, `lib/docs/read-source.ts`, plus `outputFileTracingIncludes`
  - examples: `scripts/build-examples.mjs`, which writes the committed `example-registry.tsx`, and `example-renderer`
  - install command: `install-command`, the `remark-install-command` plugin, and the vendored `code-block-command`
  - `props-table`, `page-actions` (copy prompt, install, source; open in ChatGPT, Claude or v0), `search-dialog`, and `sidebar-controls`
- **Registry as data:** `lib/docs/registry.ts` (`resolveInstall`, `registryItemForPath`, and so on).
- **LLM routes:** `llms.txt`, `llms-full.txt`, `llms.mdx/[[...slug]]`, the `markdown-components` map, and the `/docs/*.md` rewrite.
- **Tests:** vitest with jsdom, `registry.test.ts`, the Playwright crawl of every docs page, and `scripts/test-install.mjs`.
- **Landing page:** the hero (pill link, headline, two CTAs, install command), a live showcase grid of tiles linking to docs pages, the swatch row, and "Browse all N components".

Pin Fumadocs to audiocn's working set (`fumadocs-core` / `fumadocs-ui` 16.15.17, `fumadocs-mdx` 15.4.5) unless a newer release supports Next 16.4. Read `node_modules/next/dist/docs/` before writing routes, as `AGENTS.md` requires. Check whether `fumadocs-typescript` works on this repo's TypeScript 5. If it does, generate prop tables; if not, write them by hand like audiocn.

## v1 catalogue

Phase 1 turns this into a checked inventory against Videorc `origin/main` at a pinned SHA. Each row gets tagged _extract_, _needs adapter_, or _skip_.

**Foundation**

- `theme`
- `icons`
- `utils` (stock `cn`)
- `platform`: the ⌘ / Ctrl glyphs
- `accelerator`: parses Electron accelerators. It's the generic half of `lib/shortcuts.ts`; Videorc's shortcut table stays in the app.
- `use-reduced-motion`: renamed or merged so it doesn't collide with audiocn's hook of the same file name
- `use-theme-toggle`

**shadcn `ui/`, ported to Base UI**

accordion, alert, alert-dialog, avatar, badge, button, checkbox, collapsible, command (cmdk), context-menu, dialog, dropdown-menu, empty, field (with `field-context`, `SettingsRow`), hover-card, input, input-group, kbd, label, popover, progress, scroll-area, select, separator, skeleton, slider, sonner, spinner, switch, tabs (with `tabs-variants`), textarea, toggle, toggle-group, tooltip, chart.

**Videorc `ui/`**

segmented-control, info-tooltip, disabled-reason, shortcut-keys, shortcut-tooltip, chrome-row.

**audiocn forks** (only where Videorc's copy differs from audiocn's)

fader, level-meter, mixer, parameter-slider, lcd-display, lcd-meter, sound-pad, db-readout, db-scale, channel-toggle, clip-indicator, bar-visualizer. bar-visualizer started from ElevenLabs UI; keep its MIT attribution.

**Primitives (`components/`)**

- Rows and lists: list-row (`ListRow`, `GroupedList`, `ListRowButton`), navigable-row, section-label.
- Page structure: panel-section, page, pane (`Pane`, `Toolbar`, `PaneBody`, `PaneStrip`), page-tabs.
- Cards and menus: media-card, kebab-menu (with kebab-context-menu).
- Dialogs and alerts: confirm-dialog, lock-alert.
- Status: status-badge, status-dot, status-bar (`StatusBarAction`, `StatusBarHint`).
- Window chrome: window-frame (`WindowHeader`), pin-window-button, chrome-ground.
- Controls: device-picker, power-slider, theme-toggle.
- Other: error-boundary, platform-glyph.

**Known coupling to cut while extracting**

- Any `window.videorc.*` call becomes a prop or callback. Examples: glass-wallpaper's IPC, and pin-window-button's pinned state, which is already prop-shaped.
- Imports from app-only libs (`lib/lock-view`, `lib/state-labels`, `lib/format.ts`'s capture helpers) stay in Videorc. The primitive takes the resolved values as props.
- Brand marks (YouTube, X, Twitch) in platform glyphs carry trademark rules. Ship neutral glyphs or document the rules on the docs page.
- **Out of v1 (later "blocks" phase):** Go Live dialog, chat and comment rows, Stream Manager panes, the status-bar session, scenes gallery, device sections, Buddy cards. Each needs its state split from its presentation inside Videorc first.

## Radix → Base UI port rules

Apply these to every ported component and every Videorc call site:

- `asChild` → `render={<X />}`. Add `nativeButton={false}` when the rendered element isn't a button.
- `data-state=…` selectors and classes → `data-open` / `data-closed` / `data-checked` / `data-unchecked` / `data-active` / `data-disabled`.
- **Select:**
  - `items` on the root
  - the placeholder becomes a `{ value: null }` item
  - `position="popper"` → `alignItemWithTrigger={false}`
- **ToggleGroup:** values are arrays, `type` is gone and `multiple` replaces it. **Slider:** a scalar for one thumb. **Accordion:** `multiple` and an array `defaultValue`.
- **Keep Videorc's fixes:**
  - the menu and select scroll fix (`onWheelCapture`, `overscroll-contain`)
  - the dialog with no backdrop blur (the blur froze the compositor)
  - `CommandDialog` wrapping its children in `Command`
  - `closeButton` on by default for sonner
- **Behaviour parity checklist, run per overlay:**
  - initial focus (the design skill relies on AlertDialog focusing Cancel)
  - Escape
  - focus return
  - typeahead
  - roving focus in SegmentedControl
  - `DisabledReason` with `focusable={false}` inside menu and select items
  - a hover tooltip on a disabled control

## Phases

Each phase lands as small PRs. "Done when" is the bar for each.

### Phase 0 — Reset and site skeleton (videorc-ui)

1. **Re-init as `base-rhea` / stone / Phosphor.**
   - Drop `@remixicon/react` and Remix icons.
   - Swap the fonts for Videorc's system stack.
   - Keep Ultracite 8, husky and pnpm.
2. **Add Fumadocs:**
   - `source.config.ts`, `lib/source.ts`, the docs layout and page
   - `mdx-components.tsx`
   - the `postinstall` / `typecheck` scripts
   - the `fumadocs-mdx:collections/*` tsconfig path
3. **Port audiocn's docs infrastructure** (see the list above), and add `lib/site.ts` (`@videorc`, `https://ui.videorc.com/r/{name}.json`, `TheOrcDev/videorc-ui`).
4. **Registry build:**
   - `registry.json` skeleton
   - `registry:build` writing to `public/r` (gitignored)
   - `build` = examples → registry → next
5. **Tests:**
   - vitest and `registry.test.ts`
   - Playwright crawl
   - `test-install.mjs` with **two fixtures**: a Next `base` app and a **Vite, `rsc: false`, Prettier app shaped like Videorc**. The second runs `shadcn add`, then `prettier --write`, then `tsc`.
6. **Lint:** an Ultracite 8 override for `components/ui/**` (registry code: no Next, a11y relaxations as in audiocn), and the shadcn-file and vendored-file overrides.

**Done when:**

- `pnpm build` and `pnpm check` are green.
- `/docs` renders the Introduction and Installation pages.
- `button` installs into both fixtures and type-checks.

### Phase 1 — Inventory, theme, foundation

1. **Write `plans/002-inventory.md`:**
   - every candidate from the catalogue against Videorc `origin/main` @ SHA, tagged _extract_ / _needs adapter_ / _skip_
   - its imports, its call-site count in Videorc, and (for audiocn components) whether it differs from upstream after normalising formatting
2. **Write `plans/003-conventions.md`:** the registry rules, the docs page template (preview → installation → usage → anatomy → examples → keyboard → theming → accessibility → API reference), and the port rules above.
3. **Run the theme spike**, then ship `@videorc/theme`, `icons`, `platform`, `accelerator` and the hooks.
4. **Concepts docs:**
   - Design language (condensed from the design skill, with no app-internal paths)
   - Theming and tokens
   - Icons
   - Desktop scale
   - Using it in Electron (translucency, passing window state in as props)
5. **Build `PreviewGround`**, and set the site's dark and light look on the Videorc tokens.

**Done when:**

- `npx shadcn add @videorc/theme` (from the local build) leaves a fresh fixture with Videorc's tokens and utilities working.
- The concepts pages render.

### Phase 2 — shadcn `ui/` on Base UI

1. Port the 35 components, starting from base-rhea's files and re-applying Videorc's customisations.
   - Badge: `success`/`warning` variants and the radius.
   - Button: radius, timing, outline, and the `record` variant with `data-lit`.
   - Dialog: `size`, `DialogBody`, `shadow-glass`, no blur.
   - Command, select and dropdown: the fixes listed above.
   - Kbd: Videorc's chip.
2. Normalise the radius tiers while porting. Videorc's copies are inconsistent: some are `rounded-md`, others `rounded-2xl`, `rounded-3xl` or `rounded-xl`. Panel, row and chip are the only tiers.
3. Each item gets a docs page, a default example, and a states example (disabled, invalid, open).

**Done when:**

- Every item installs into both fixtures.
- Playwright opens every page and toggles every Preview/Code tab with no console errors.
- The parity checklist is ticked for each overlay.

### Phase 3 — Videorc `ui/` and primitives

1. Extract `segmented-control`, `info-tooltip`, `disabled-reason`, `shortcut-keys`, `shortcut-tooltip` and `chrome-row`. Bring their existing Videorc unit tests along as vitest tests.
2. Extract the primitives, turning app coupling into props as listed above.
3. Docs live under `content/docs/primitives/`. Each page has the anatomy and the "use this for" rule from the design skill's component mapping.

**Done when:** the same bar as Phase 2, plus the moved unit tests pass.

### Phase 4 — audiocn forks

1. For each audiocn component in Videorc, diff Videorc's copy against audiocn's current source. Run both through the same formatter and normalise imports first.
2. Fork only the changed ones as `@videorc/<name>`, keeping `@audiocn/core` (or our fork of it) as a dependency. Unchanged ones stay `@audiocn/<name>` dependencies.
3. Add attribution in `THIRD_PARTY_NOTICES.md` and in each item's docs page.

**Done when:** a fixture with only `@videorc` configured (plus `@audiocn`, if any dependency remains) installs the mixer and LCD meter and type-checks.

### Phase 5 — Landing page

Build it like audiocn's:

- the hero: a pill link, the headline, Get started and Browse components, and `npx shadcn@latest add @videorc/<flagship>`
- a background treatment in Liquid Chrome
- "Everything here is live" with Dark/Light swatches
- the showcase grid of live tiles, each linking to its docs page: ⌘K palette, status bar, segmented control, grouped list with kebab menus, device picker, mixer with faders, LCD meter, confirm dialog, shortcut chips
- "Browse all N components"
- OG and social images, as audiocn's `og:build` does

**Done when:** the page renders in both themes, the Playwright responsive and metadata specs pass, and every tile links to an existing page.

### Phase 6 — Ship the registry

1. Add the MIT `LICENSE` and `THIRD_PARTY_NOTICES.md` (shadcn/ui, audiocn, ElevenLabs UI, Phosphor).
   - Note in the README that the Videorc name and logo fall under Videorc's `TRADEMARK.md` rules, not MIT.
2. Write the README: how to develop, and how to add a component.
3. Deploy to Vercel and point DNS for `ui.videorc.com`.
4. Check a few install paths:
   - `npx shadcn@latest add @videorc/button`
   - the direct URL install
   - the `/docs/*.md` twins and `llms.txt`

**Done when:** a scratch app installs from the production URL.

### Phase 7 — Videorc adopts the library (in the Videorc repo)

Videorc is a production app. This phase follows Videorc's `AGENTS.md` gates and its UI/Product Design route, and lands one PR per family.

1. **Wiring:**
   - Add `"@videorc": "https://ui.videorc.com/r/{name}.json"` to `apps/desktop/components.json`.
   - Add `scripts/sync-ui.mjs` (`pnpm ui:sync <items…>`). It runs `shadcn add @videorc/<items> --overwrite --yes`, or the `http://localhost:3000/r/<item>.json` URLs with `--local`, then runs `prettier --write` on the touched files and prints the diff.
   - Add `ui:check`, which fails CI when a synced file has drifted from the registry. This is the guard that keeps the source of truth here.
2. **Theme first:** import `shadcn/tailwind.css` and the theme, and remove the hand-written `data-horizontal` / `data-vertical` variants.
3. **Families, each with its call sites, unit tests and smoke selectors updated in the same PR:**
   1. leaf components (badge, kbd, separator, label, input, textarea, skeleton, spinner, empty, alert, and button with its `asChild` sites)
   2. overlays (tooltip, popover, hover-card, dialog, alert-dialog, dropdown, context-menu, select, command)
   3. form controls (checkbox, switch, slider, toggle, toggle-group, tabs, segmented-control, accordion, collapsible, scroll-area, progress)
   4. Videorc ui and primitives
   5. audiocn forks
4. **Last:** remove `radix-ui`. Flip the ESLint rule from "Base UI only in audiocn files" to "no `radix-ui`". Update the design skill's paths and its Radix-specific wording.

**Scale to plan for** (Videorc `origin/main`, non-test files):

- 94 `asChild` in 56 files
- 49 `data-state` uses in 31 files
- 708 `@/components/ui/*` imports across 178 files
- 153 Radix-attribute or `asChild` hits in 65 test and smoke-script files (`scripts/smoke-first-run-app.mjs`, `perf-idle-probe.mjs`, `preview-window-probe.mjs`, and others)

**Gates per family:**

- `pnpm typecheck`, `pnpm lint`, `pnpm format:check`
- `pnpm --filter @videorc/desktop test`
- `pnpm build`
- `pnpm check:renderer-assets` (the bundle budget)
- `pnpm smoke:screens`
- the overlay families also run the smoke scripts whose selectors changed

### Later — Blocks

Once Videorc has split state from presentation, extract product blocks with mock data in the docs: Go Live dialog, chat and comment rows, Stream Manager panes, status-bar session, scenes gallery, device sections. Each block is a separate plan.

## Day-to-day workflow after adoption

1. Change the component in videorc-ui, with its docs and example updated in the same PR.
2. Merge, and Vercel deploys `ui.videorc.com/r`.
3. In Videorc, run `pnpm ui:sync <items>`, review the diff, and run the gates.
4. For tight loops, run `pnpm dev` here and `pnpm ui:sync --local <items>` in Videorc.

Never edit a synced file in Videorc. `ui:check` fails if anyone does.

## Risks

- **The Base UI migration touches about 180 files of a production app.** Mitigations: one family per PR, smoke gates, and the parity checklist. The overlays carry the most keyboard and focus risk.
- **Videorc moves fast** (744 commits in about five weeks). Once a component is extracted, any Videorc change to it goes through here. Each slice pins the SHA it extracted from and re-diffs before merging.
- **Translucent tokens look broken on a plain web page.** `PreviewGround` and the site background exist for this.
- **Formatting churn** between oxfmt here and Prettier in Videorc. `ui:sync` always formats, and `ui:check` compares formatted output.
- **The theme CSS may not survive the CLI's merge.** The Phase 1 spike decides this, and the `registry:file` stylesheet is the fallback.
- **Licences:**
  - Nucleo never enters this repo.
  - Brand glyphs follow each platform's rules.
  - The Videorc trademark is separate from MIT.

## Findings while building (2026-10-30)

- **The shadcn CLI can't carry `@custom-variant` through an item's `css`.** The theme is generated from `styles/videorc.css` into `cssVars` and `css` by `pnpm theme:build`. Videorc's `win32` variant (unused by any component) stays in the app.
- **The CLI keeps `"use client"` in `rsc: false` apps.** That's harmless: Vite ignores the directive.
- **Stock `cn` drops Videorc's type tokens and can't override the size and radius tokens.** The registry ships Videorc's configured `cn` as `@videorc/utils`.
- **Base UI differences Videorc's call sites must absorb in Phase 7:**
  - `asChild` → `render`.
  - Menu items: `onSelect` → `onClick`.
  - Select needs `items`.
  - `onValueChange` arguments: ToggleGroup and Accordion take arrays, and a single-thumb Slider takes a scalar.
  - `onValueCommit` → `onValueCommitted`.
  - Checkbox: `checked="indeterminate"` → `indeterminate`.
  - Attribute selectors:
    - `data-state=open` → `data-open` / `data-popup-open` / `data-panel-open`;
    - `data-state=active` → `data-active`;
    - `data-state=on` → `data-pressed`.
  - HoverCard delays move to the trigger.
  - Focus props: `onOpenAutoFocus` / `onCloseAutoFocus` → `initialFocus` / `finalFocus`.

  The family ports list these in their reports, and Phase 7 works through them family by family.

## Owner answers (2026-10-30)

- The domain is `ui.videorc.com`.
- Retro LCD is not shipped. It stays in Videorc, and the swatch row is Dark / Light only.
- The landing page is in scope.
- The GitHub repo `TheOrcDev/videorc-ui` is private. The registry and docs are public through `ui.videorc.com`; making the repo public is the owner's call.
