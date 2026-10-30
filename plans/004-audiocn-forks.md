# 004 — audiocn forks

Phase 4 of [`001-videorc-ui-library.md`](./001-videorc-ui-library.md): diff every audiocn file Videorc carries against audiocn, fork the ones Videorc changed as `@videorc/<name>`, and leave the rest as `@audiocn/<name>` dependencies.

- **Videorc:** `origin/main` @ `8a8f3e98`, `apps/desktop/src/renderer/src`.
- **audiocn:** `origin/main` @ `05bec0f` (2026-10-30), read with `git show`, never the working tree.

## Method

- Both sides go through this repo's oxfmt (`pnpm exec oxfmt --stdin-filepath x.tsx < file`) and are diffed.
  - audiocn's files come out byte for byte the same, because it formats with the same Ultracite preset. So a Videorc copy's normalised form is exactly "upstream plus Videorc's edits".
- A second pass through Prettier at audiocn's settings, which sorts neither classes nor keys, gives the same six files and the same lines. Normalising hid nothing.
- Import paths needed no rewriting: both sides import through `@/components/ui/*`, `@/hooks/*` and `@/lib/*`.

## Diff

### Components

| File | Result | What Videorc changed |
| --- | --- | --- |
| `ui/fader` | **changed** | Liquid Chrome (plan 208): the range is `chrome-fill`, not `bg-primary`; the default thumb is `chrome-bead ring-knob-ring`, not `bg-background ring-foreground/15 shadow-sm`. The console thumb keeps upstream's surface. Radius tiers (plan 174): the console thumb is `rounded-chip`, not `rounded-sm`; the value, its editor and Reset are `rounded-row`, not `rounded-md`. |
| `ui/parameter-slider` | **changed** | Liquid Chrome: the range is `chrome-fill`, the thumb `chrome-bead ring-knob-ring`. Radius tiers: Reset is `rounded-row`. |
| `ui/level-meter` | identical |  |
| `ui/mixer` | identical |  |
| `ui/lcd-display` | identical |  |
| `ui/lcd-meter` | identical |  |
| `ui/sound-pad` | identical |  |
| `ui/db-readout` | identical |  |
| `ui/db-scale` | identical |  |
| `ui/channel-toggle` | identical |  |
| `ui/clip-indicator` | identical |  |
| `ui/bar-visualizer` | identical | Upstream carries the ElevenLabs UI attribution, so nothing is owed here. |

Videorc skins the unchanged ones from outside, at its call sites (Retro LCD's `LCD_FADER`, the meters' adapters), never by editing them.

### Core (`lib/audio/*`)

Videorc carries 11 of `@audiocn/core`'s 14 files; it has no `history`, `history-playback` or `click`.

| File | Result | Notes |
| --- | --- | --- |
| `ballistics`, `bands`, `bar-levels`, `frame-source`, `taper`, `time`, `wave-line`, `zones` | identical |  |
| `frame-loop` | behind upstream | Videorc has audiocn's single-phase loop from before `8f9700a` (2026-10-03). Upstream has since split it into update and paint phases with `subscribeFrame(listener, phase = "paint")`, which is backwards compatible. |
| `types` | behind upstream | Upstream added the optional `historyUpdatedAt`, `historyIntervalMs` and `historyPreviousLevel` fields (`f0c1803`). Videorc's copy also lost `ChannelLevel`'s doc comment. |
| `decibels` | one doc comment lost | `DEFAULT_MIN_DB`'s doc comment is missing; the code is identical. |

None of this is a Videorc edit: the copy is an older upstream.

### Hooks

| File | Result | Notes |
| --- | --- | --- |
| `use-audio-config`, `use-frame-source`, `use-visibility`, `use-clip-hold` | identical |  |
| `use-reduced-motion` | Videorc addition | It adds `smoothScrollBehavior()` (plan 174); `useReducedMotion` is identical. It already ships as `@videorc/use-reduced-motion`, a superset of audiocn's hook at the same path. |

## Decisions

1. **Fork `fader` and `parameter-slider`** as `@videorc/fader` and `@videorc/parameter-slider`.
   - Each file is Videorc's copy plus an attribution header. The knob comment drops its plan number.
   - Their `registryDependencies` are `@videorc/theme`, `@videorc/utils` and the unchanged upstream items they import: `@audiocn/core`, `@audiocn/use-audio-config`, and for the fader `@audiocn/db-scale`.
2. **Every other component stays `@audiocn/<name>`.** That's ten of the twelve; there is no item or docs page for them here.
3. **Don't fork the core or the hooks.** Videorc's differences are lag, not edits, and upstream's current core is a compatible superset. The forks depend on `@audiocn/core`.
4. **The forks keep upstream's shape:** `export const` arrow components, upstream's `data-slot` names, no trailing export list.
   - This departs from 003's "keep shadcn's shape". The fork's whole value is a short class diff against upstream, and restructuring 900 lines would turn every upstream sync into a hand merge.
   - The registry-code lint override already allows it.
5. **`use-reduced-motion`:** neither fork imports it, so neither pulls `@audiocn/use-reduced-motion`. See [Adopting in Videorc](#adopting-in-videorc) for the `@audiocn` items that do.
6. **Tokens:** depend on `@audiocn/core`, and make the theme win by the cascade rather than by install order. See [Tokens](#tokens).

## Tokens

`@videorc/theme` aliases audiocn's meter and channel tokens to Videorc tones: a healthy level is chrome, hot is `--warning`, a pressed mute is amber. `@audiocn/core` writes the same keys through its `cssVars` with audiocn's colours: emerald, amber, red and blue.

**How the CLI behaves** (shadcn 4.23, `@shadcn/registry` 0.2.1):

- **Merge order:** resolving a tree, it sorts `registry:theme` items first, then deep-merges every item's `cssVars` in that order. A later item wins, so `@audiocn/core` (a `registry:lib`) beats `@videorc/theme` in any install that resolves both.
- **Overwriting:** it replaces an existing declaration only when a _requested_ item, not a dependency, is a theme, style, font or base.
- **`css` rules:** a selector rule from an item's `css` is written after the `cssVars` pass. A new rule is appended at the end of the file, and its declarations always replace.

**What that means** for anything that installs `@videorc/theme` and `@audiocn/core` together, such as `@videorc/fader`:

| Install | Meter and channel tones |
| --- | --- |
| A fresh project, `add @videorc/fader` | audiocn's: the variables don't exist yet, and the merged payload holds audiocn's values |
| `add @videorc/theme @videorc/fader` in one command (`test-install` does this) | audiocn's, overwriting ours, because a theme was requested |
| `add @videorc/theme`, then `add @videorc/fader` | Videorc's: existing variables are kept |
| Videorc's hand-written `styles.css` | Videorc's: the CLI adds audiocn's values to the `:root` and `.dark` rules, but Videorc's `:root, .dark` alias block comes later in the file and wins |

The forks draw no meter or channel tokens themselves. The damage lands on any `@audiocn` level meter, LCD meter, clip indicator or channel toggle installed beside them.

**Options:**

- **Fork the core as `@videorc/core` with Videorc's values.** Rejected. `@audiocn/db-scale` and `@audiocn/use-audio-config` depend on `@audiocn/core`, so it stays in the tree anyway.
  - Two libs would write the same `lib/audio/*.ts` paths.
  - The `cssVars` order between two non-theme items follows the tree walk.
  - Avoiding that means forking the whole closure (`core`, `use-audio-context`, `use-audio-config`, `db-scale`), which is unchanged code.
- **Depend on `@audiocn/core` and document "install the theme first".** This fixes only the third row. The first two are what people type, and what `test-install` runs.
- **Chosen: depend on `@audiocn/core`, and have the theme ship the aliases as a `css` rule on `:root, .dark` as well as in `cssVars`.**
  - That rule lands after the `cssVars` blocks and always replaces, so Videorc's tones win in every row above.
  - Re-installing either side keeps them.
  - The aliases stay in `cssVars` too, so `resolveInstall` still lists them on docs pages.

**The integrator's change.** `registry.json` is generated from `styles/videorc.css`, so the change goes in `scripts/build-theme.mjs`. Then run `pnpm theme:build`.

```js
// @audiocn/core writes its own meter and channel colours through cssVars, and
// the CLI merges a lib's cssVars after a theme's, so audiocn's would win. A
// `css` rule is written after every cssVars block and always replaces its
// declarations, so the aliases ship there too and win by source order.
const PINNED = /^--(?:meter|channel)-/u;

// in convert(), the ":root, .dark" branch:
} else if (selector === ":root, .dark") {
  assignVars(cssVars.light, node);
  assignVars(cssVars.dark, node);
  for (const decl of node.nodes ?? []) {
    if (decl.type === "decl" && PINNED.test(decl.prop)) {
      css[selector] = { ...css[selector], [decl.prop]: clean(decl.value) };
    }
  }
}
```

This was checked against the CLI's own writers (`transformCssVars`, then `transformCss`, from `@shadcn/registry`) on a fresh file, with the merged payload of the first row:

- `:root` and `.dark` received audiocn's `--meter-ok` (emerald) and `--channel-mute` (destructive).
- The pinned `:root, .dark` rule came after them with Videorc's values, so it wins at equal specificity.

Until that lands, the safe order is `add @videorc/theme` in its own, earlier command.

## Adopting in Videorc

- **Call sites:** none change. The forks keep Videorc's paths, exports and props, and each file is Videorc's copy byte for byte apart from the header comment.
- **Redundant overrides:** `FADER_THUMB` in `components/audio/gain-faders.tsx` and the two `PARAMETER_THUMB` constants (`bg-knob ring-knob-ring`) predate plan 208. They're harmless, because `chrome-bead` paints a `background-image` over `bg-knob`'s colour. Drop them when convenient.
- **`shadcn add @videorc/fader @videorc/parameter-slider` prompts:**
  - It asks to update `lib/audio/frame-loop.ts`, `types.ts` and `decibels.ts` to upstream. Accept: the changes are backwards compatible.
  - It adds `lib/audio/history.ts`, `history-playback.ts`, `click.ts` and `hooks/use-audio-context.tsx`.
- **Existing hazards with unchanged `@audiocn` items.** These aren't caused by the forks, but are worth knowing when re-adding any of them:
  - `@audiocn/level-meter` and `@audiocn/bar-visualizer` pull `@audiocn/use-reduced-motion`, which writes `hooks/use-reduced-motion.ts`. Decline: ours is a superset and adds `smoothScrollBehavior`.
  - `@audiocn/sound-pad` pulls stock shadcn `kbd`.
  - `@audiocn/mixer` pulls `@audiocn/channel-strip`, which pulls stock shadcn `badge`.
  - Decline overwriting `@videorc/kbd` and `@videorc/badge`.

## Files

**Registry items:**

- `components/ui/fader.tsx`
- `components/ui/parameter-slider.tsx`

**Site-only dependencies**, copied verbatim from audiocn `origin/main` @ `05bec0f`. They exist only so the docs site compiles; they are not registry items, and consumers get them from `@audiocn`.

- `components/ui/db-scale.tsx`
- `hooks/use-audio-config.tsx`
- `lib/audio/ballistics.ts`, `decibels.ts`, `taper.ts`, `types.ts`

**Docs and tests:**

- Examples: `components/examples/fader-{demo,gain,console}.tsx` and `parameter-slider-{demo,value,frequency}.tsx`.
- Docs: `content/docs/components/fader.mdx` and `parameter-slider.mdx`, each with a link to audiocn's page and a list of what differs.
- Tests: `components/ui/fader.test.tsx` and `parameter-slider.test.tsx`. These are audiocn's behaviour tests plus checks that pin Videorc's paint.

## Follow-ups

- **`scripts/test-install.mjs`:** the fixtures register only `@videorc`, so `@audiocn/*` dependencies won't resolve.
  - Add `"@audiocn": "https://audiocn.dev/r/{name}.json"` to each fixture's `registries`. This needs the network.
  - Assert that the meter aliases win once the theme change above lands.
- **Phase 4's bar** ("installs the mixer and LCD meter") names two items that stay `@audiocn`. The fixture can install `@audiocn/mixer` and `@audiocn/lcd-meter` beside `@videorc/theme`, or the bar can become the two forks.
- **`THIRD_PARTY_NOTICES.md`** (Phase 4 step 3, Phase 6): list audiocn (MIT) for `fader` and `parameter-slider`.
- **Sync upstream:** re-run this diff when audiocn changes `fader` or `parameter-slider`. The fork is upstream plus the class strings listed above.
