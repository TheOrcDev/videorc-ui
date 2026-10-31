# 005 — Record button

Status: slices 0–2 shipped in videorc-ui, 2026-11-01. Slice 3, the resync into Videorc, comes later. On 2026-11-01 the owner asked for the whole plan, so every decision below went the proposed way (see [Decisions](#decisions)).

- **Videorc:** `origin/main` @ `6fd9846c`. Record lives in `components/studio/session-panel.tsx` (`SessionTransport`).
- **videorc-ui:** `main` @ `6f50a9d`. Record is `Button variant="record"` (`chrome-led`), lit with `data-lit`.

## Goal

One red Record button, built here and resynced into Videorc. It should be the most physical control in the app: a red LED lens set in a ring of Liquid Chrome. You should be able to see from across the room whether it is recording.

## What's wrong with today's

- **Lit and unlit look nearly the same.** Idle Record is already a bright red, and lit only adds a 12px glow. A streamer who glances at it can't tell whether it is recording.
- **It has no material of its own.** It is `chrome-fill`'s gradient recoloured red. Go Live…, beside it, is polished chrome, and the `chromatic` ring has since given the app a stronger chrome. Record looks flat next to both.
- **The busy states give no feedback.** Between the click and the backend's answer, Record is a dimmed button. While a stop finalizes, the stop button is dimmed too. Neither one says "working on it".

## The design

### Anatomy

| Part | What it is |
| --- | --- |
| **Bezel** | The button's 2px border box: the `chromatic` ring's bands of metal, held still. Silver in dark, black chrome in light, with the same tokens (`--chrome-chromatic-bands`). This is what ties Record to Go Live… and to the rest of the chrome. |
| **Lens** | The face inside the bezel: red LED glass. It has a dome highlight across the top third and a rim shade, so it reads as a convex lens and not a flat fill. |
| **Bloom** | Light that spills past the bezel while lit. It lives on a `::after` layer, so it can be faded without repainting the button. |
| **Glyph and words** | `RecordIcon` while idle, `StopIcon` once lit, then the label. The Space key chip rides inside at idle, as it does in Videorc. |

### States

| State | Words (Videorc's copy) | Lens | Bloom | Interactive |
| --- | --- | --- | --- | --- |
| Idle | Record + Space | Unlit: a deep red, like an LED that's switched off | None | Yes |
| Idle, hover |  | Warms a third of the way to lit | Faint |  |
| Pressed |  | Sinks: the gradient flips and the top shades. No translate. | Dips |  |
| Starting | Record | Lit, from the click | Off | No, but not dimmed |
| Running | Stop recording, or End livestream | Lit, with light gathering at the rim | On, breathing | Yes |
| Stopping | Stopping… | Lit | Fades out | No, but not dimmed |
| Force stop | Force stop | Lit (Running, in its own words) | On, breathing | Yes |
| Blocked | Record | Dead: a flat lens, a flat bezel, 50% opacity | None | No, with `DisabledReason` |

Starting and Stopping are the same lesson as Go Live's "Checking…": the control answers from the click. They are non-interactive but not dimmed, because the LED is the feedback. Both are `aria-disabled` (Base UI's `focusableWhenDisabled`), so they keep keyboard focus and the native `:disabled` look never applies; the material keys the busy look, a lit lens with no bloom, on `aria-disabled`.

### Rules it keeps

- **Red stays information.** The LED is still Record's alone, and Delete stays `destructive`.
- **Shine on the control only.** No red on the pane, the row or the text around it.
- **The label passes AA on the lens.** The light comes from the rim and the bloom, not from brightening the face under the words. White reaches 4.5:1 only up to an OKLCH lightness of about 0.58, so no lens stop goes above it, and `styles/chrome-led.test.ts` pins the contrast of white on every lens stop in both themes.
- **Increase Contrast** adds `--chrome-edge` around the bezel, as every chrome material does. **Forced colours** drop the gradients, so the border falls back to `ButtonText`.
- **Light mode** is the invert: a black-chrome bezel around the same red lens, with a weaker bloom (45% of `--live` versus dark's 60%).

### Motion

The one loop: while running, the bloom breathes, slowly (about 2.4s, ease-in-out), between about 55% and 100% opacity. That's a camera's tally light: it says "rolling" without anyone reading a word.

- **It animates opacity only,** on the `::after` layer. A session runs for hours while Videorc encodes video, so a loop that repaints every frame (the way `chromatic`'s turning conic gradients do) is not acceptable here. Opacity composites without a repaint.
- **The bezel stays still.** One moving thing per control.
- **Reduced motion** holds the bloom steady at about 85%.

This breaks Videorc's D5 ("nothing moves outside the Welcome screen"); the owner took it with the rest of the plan on 2026-11-01. `chromatic` is the precedent: it already moves, and it is already outside the still-materials guard.

## API

The look lives in the `chrome-led` material, so `Button variant="record"` gets it everywhere with no call-site change. On top of it, a thin composite owns the mapping from state to icon, lit and busy:

```tsx
<RecordButton state="idle" onClick={start}>
  Record
  <ShortcutKeys accelerator="Space" />
</RecordButton>

<RecordButton state="running" onClick={stop}>
  End livestream
</RecordButton>
```

- `state`: `"idle" | "starting" | "running" | "stopping"`. "Running" covers a recording and a livestream; the words say which.
- `children` are the words. When they're omitted, each state uses the design skill's copy ("Record", "Stop recording", "Stopping…"). Videorc passes its own from `lib/go-live-copy.ts` and `session-stop.ts`.
- It sets `data-lit` (every state but idle), `data-state`, the icon and the busy behaviour. Everything else passes through to `Button`, including `size`, `disabled` and `className="flex-1"`.
- It is a one-shot action whose label changes, so it takes no `aria-pressed`. The session status pill (`role="status"`) announces the change, not the button.

The lean alternative is to skip the composite and only upgrade the variant. That's less code, but Videorc keeps hand-rolling the icon swap and `data-lit` at every call site, and the busy states have no home.

## Slices

### 0. States board (the decision gate)

One example, `record-button-states`, that renders every state in the table above, side by side, in dark and light, at `lg` and the default size. The token values were tuned on this board, and it ships as the States example on the docs page. Tune them here, not in review.

### 1. The material

- `styles/videorc.css`: new tokens in both themes (`--chrome-led-off-stops`, `--chrome-led-off-flat`, `--chrome-led-dome`, `--chrome-led-rim-light`, `--chrome-led-bezel-flat`), plus `--chrome-led-lit-shadow` and `--chrome-led-pressed-shadow`. `--chrome-led-stops`, `--chrome-led-flat` and `--chrome-led-glow` keep their names (the lit lens and the bloom), so Videorc's guard changes less. The bezel layer comes from `--chrome-chromatic-bands`, with the `::after` bloom and `@keyframes chrome-led-breathe`. `@utility chrome-led` is rewritten. `styles/chrome-led.test.ts` guards the tokens, the contrast and the motion.
- `components/ui/button.tsx`: `record` becomes `chrome-led` alone, since the bezel needs the border, as `chromatic` does. Update its comment.
- `pnpm theme:build`, then `components/ui/button.test.tsx` and `examples/button-record.tsx`.

### 2. The composite

- `components/record-button.tsx`, `components/record-button.test.tsx` (icon, words, `data-lit` and busy behaviour per state, and props passing through).
- Examples: `record-button-demo` (click to record, then stop), `record-button-states` (from slice 0), `record-button-transport` (beside Go Live…, as in the Studio).
- `content/docs/primitives/record-button.mdx` (a primitive, under Controls and feedback), with its examples in `components/docs/example-registry.tsx`. Button's Record section points to it.
- Social cards: `record-button-demo` clicks itself lit for its card, and every card that shows the record LED was recaptured (`pnpm og:build --only …`).
- `registry.json`: `record-button`, depending on `@videorc/button`, `@videorc/icons`, `@videorc/theme`. Then `pnpm registry:build`.

### 3. Resync into Videorc (later, in Videorc)

- Resync the theme CSS and `button`, then add `@videorc/record-button` with the shadcn CLI, the same way the `chromatic` commits did.
- `SessionTransport`: swap both Record and stop `Button`s for `RecordButton`. `DisabledReason`, `ShortcutKeys` and the copy stay where they are.
- `glass-chips.test.ts`: if the breathing is approved, `chrome-led` leaves the still `MATERIALS` list, like `chromatic`. Update the `data-lit` regex, and add the lens contrast checks to `window-contrast.test.ts`.
- The design skill: amend D8 (the LED's look and states), and D5 if the motion is approved, with the owner's date.
- Check `session-transport.test.ts` (it reads `data-lit`), run `smoke:screens`, and check the bloom isn't clipped by the inspector's scroll container. The transport's 16px gutter leaves room for a bloom of about 12px.
- **The Retro LCD look keeps its own outlined record key.** It is a different look, not this button.

## Not doing

- **A clock inside the button.** `SessionClock` already sits right above it.
- **A 3-2-1 countdown before recording.** It changes when a recording starts, so it's a product decision, not a button.
- **Red on Go Live….** It stays the chrome primary.
- **A round, icon-only Record disc.** Record has one home today, the Studio inspector. Revisit when a second surface needs one.

## Decisions

Taken on 2026-11-01, when the owner asked for the whole plan; each went the proposed way:

1. **Motion while running:** the bloom breathes. The alternatives were holding it steady, or flowing the bezel, which repaints every frame for the whole session.
2. **Idle lens:** a dark, switched-off red, not today's bright red.
3. **Scope:** the `RecordButton` composite plus the material, not the material alone.
4. **Busy states:** Starting and Stopping light the LED without dimming it.
