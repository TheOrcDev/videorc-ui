# 005 — Record button

Status: slices 0–2 shipped in videorc-ui, 2026-11-01, then revised the same day (see [Revision](#revision)). Slice 3, the resync into Videorc, comes later. On 2026-11-01 the owner asked for the whole plan, so every decision below went the proposed way (see [Decisions](#decisions)).

- **Videorc:** `origin/main` @ `6fd9846c`. Record lives in `components/studio/session-panel.tsx` (`SessionTransport`).
- **videorc-ui:** `main` @ `6f50a9d`. Record is `Button variant="record"` (`chrome-led`), lit with `data-lit`.

## Goal

One red Record button, built here and resynced into Videorc. It should be the most physical control in the app: metallic red, polished the way the chrome fill is. You should be able to see from across the room whether it is recording.

## What's wrong with today's

- **Lit and unlit look nearly the same.** Idle Record is already a bright red, and lit only adds a 12px glow. A streamer who glances at it can't tell whether it is recording.
- **It has no material of its own.** It is `chrome-fill`'s gradient recoloured red. Go Live…, beside it, is polished chrome, and the `chromatic` ring has since given the app a stronger chrome. Record looks flat next to both.
- **The busy states give no feedback.** Between the click and the backend's answer, Record is a dimmed button. While a stop finalizes, the stop button is dimmed too. Neither one says "working on it".
- **Its width follows its words.** "Record" turns into "Stop recording" and the button grows by half.

## The design

### Anatomy

| Part | What it is |
| --- | --- |
| **Face** | Metallic red, polished the way `chrome-fill` is: a bright band, a dark horizon just below the middle and the light coming back at the foot, with a light line along the top edge. No border and no ring. A deeper red at idle, the brand red once lit. |
| **Glow** | Light around the button while lit. It lives on a `::after` layer, so it can be faded without repainting the button. |
| **Glyph and words** | `RecordIcon` while idle, `StopIcon` once lit, then the label. The Space key chip rides inside at idle, as it does in Videorc. Every state's glyph and words sit in one grid cell and only the current one shows, so the button is as wide as its longest words in every state. |

### States

| State | Words (Videorc's copy) | Face | Glow | Interactive |
| --- | --- | --- | --- | --- |
| Idle | Record + Space | A deeper metallic red | None | Yes |
| Idle, hover |  | Lifts | Faint |  |
| Pressed |  | Turns concave: the gradient flips. No translate. | Dips |  |
| Starting | Record | Lit: the brand red, from the click | Off | No, but not dimmed |
| Running | Stop recording, or End livestream | Lit | On, breathing | Yes |
| Stopping | Stopping… | Lit | Fades out | No, but not dimmed |
| Force stop | Force stop | Lit (Running, in its own words) | On, breathing | Yes |
| Blocked | Record | Flat, 50% opacity | None | No, with `DisabledReason` |

Starting and Stopping are the same lesson as Go Live's "Checking…": the control answers from the click. They are non-interactive but not dimmed, because the lit red is the feedback. Both are `aria-disabled` (Base UI's `focusableWhenDisabled`), so they keep keyboard focus and the native `:disabled` look never applies; the material keys the busy look, a lit face with no glow, on `aria-disabled`.

### Rules it keeps

- **Red stays information.** Lit red is still Record's alone, and Delete stays `destructive`.
- **Shine on the control only.** No red on the pane, the row or the text around it.
- **The label passes AA on the metal.** The shine is in the bands, not in a brighter face under the words. White reaches 4.5:1 only up to an OKLCH lightness of about 0.58, so no stop goes above it, and `styles/chrome-led.test.ts` pins the contrast of white on every stop in both themes.
- **One width.** The button never resizes as the session moves on.
- **Increase Contrast** adds `--chrome-edge` around it, as every chrome material does.
- **Light mode** uses the same metallic red, with a weaker glow (45% of `--live` versus dark's 60%).

### Motion

The one loop: while running, the glow breathes, slowly (about 2.4s, ease-in-out), between about 55% and 100% opacity. That's a camera's tally light: it says "rolling" without anyone reading a word.

- **It animates opacity only,** on the `::after` layer. A session runs for hours while Videorc encodes video, so a loop that repaints every frame (the way `chromatic`'s turning conic gradients do) is not acceptable here. Opacity composites without a repaint.
- **The metal stays still.** One moving thing per control.
- **Reduced motion** holds the glow steady at about 85%.

This breaks Videorc's D5 ("nothing moves outside the Welcome screen"); the owner took it with the rest of the plan on 2026-11-01. `chromatic` is the precedent: it already moves, and it is already outside the still-materials guard.

## API

The look lives in the `chrome-led` material, so `Button variant="record"` gets it everywhere with no call-site change. On top of it, a thin composite owns the mapping from state to icon, lit, busy and words:

```tsx
<RecordButton
  labels={{
    idle: (
      <>
        Record
        <ShortcutKeys accelerator="Space" />
      </>
    ),
    running: "End livestream",
  }}
  onClick={session === "idle" ? start : stop}
  state={session}
/>
```

- `state`: `"idle" | "starting" | "running" | "stopping"`. "Running" covers a recording and a livestream; the words say which.
- `labels` are the words, per state. A state without one uses the design skill's copy ("Record", "Stop recording", "Stopping…"). Videorc passes its own from `lib/go-live-copy.ts` and `session-stop.ts`. They replace `children`: the button lays out every state's words to keep its width, so it needs them all up front.
- It sets `data-lit` (every state but idle), `data-state`, the icon and the busy behaviour. Everything else passes through to `Button`, including `size`, `disabled` and `className="flex-1"`.
- It is a one-shot action whose label changes, so it takes no `aria-pressed`. The session status pill (`role="status"`) announces the change, not the button. The hidden states' words are `aria-hidden` and `invisible`, so only the current words name it.

The lean alternative is to skip the composite and only upgrade the variant. That's less code, but Videorc keeps hand-rolling the icon swap and `data-lit` at every call site, and the busy states have no home.

## Slices

### 0. States board (the decision gate)

One example, `record-button-states`, that renders every state in the table above, side by side, in dark and light, at `lg` and the default size. The token values were tuned on this board, and it ships as the States example on the docs page. Tune them here, not in review.

### 1. The material

- `styles/videorc.css`: new tokens in both themes (`--chrome-led-off-stops`, `--chrome-led-off-flat`) for the idle metal. `--chrome-led-stops`, `--chrome-led-flat` and `--chrome-led-glow` keep their names (the lit metal and the glow), so Videorc's guard changes less. Both stop lists take the fill's five-band shape. The `::after` glow and `@keyframes chrome-led-breathe`; `@utility chrome-led` is rewritten. `styles/chrome-led.test.ts` guards the tokens, the contrast, the motion and the missing border.
- `components/ui/button.tsx`: `record` stays `chrome-led border-0`, like the default, so its light and shade reach the edge. Update its comment.
- `pnpm theme:build`, then `components/ui/button.test.tsx` and `examples/button-record.tsx`.

### 2. The composite

- `components/record-button.tsx`, `components/record-button.test.tsx` (icon, words, `data-lit`, busy behaviour and the stacked words per state, and props passing through).
- Examples: `record-button-demo` (click to record, then stop), `record-button-states` (from slice 0), `record-button-transport` (beside Go Live…, as in the Studio).
- `content/docs/primitives/record-button.mdx` (a primitive, under Controls and feedback), with its examples in `components/docs/example-registry.tsx`. Button's Record section points to it.
- Social cards: `record-button-demo` clicks itself lit for its card, and every card that shows Record was recaptured (`pnpm og:build --only …`).
- `registry.json`: `record-button`, depending on `@videorc/button`, `@videorc/icons`, `@videorc/theme`. Then `pnpm registry:build`.

### 3. Resync into Videorc (later, in Videorc)

- Resync the theme CSS and `button`, then add `@videorc/record-button` with the shadcn CLI, the same way the `chromatic` commits did.
- `SessionTransport`: swap both Record and stop `Button`s for one `RecordButton`, its words in `labels`. `DisabledReason`, `ShortcutKeys` and the copy stay where they are.
- `glass-chips.test.ts`: if the breathing is approved, `chrome-led` leaves the still `MATERIALS` list, like `chromatic`. Update the `data-lit` regex, and add the metal's contrast checks to `window-contrast.test.ts`.
- The design skill: amend D8 (Record's look and states), and D5 if the motion is approved, with the owner's date.
- Check `session-transport.test.ts` (it reads `data-lit`), run `smoke:screens`, and check the glow isn't clipped by the inspector's scroll container. The transport's 16px gutter leaves room for a glow of about 12px.
- **The Retro LCD look keeps its own outlined record key.** It is a different look, not this button.

## Not doing

- **A clock inside the button.** `SessionClock` already sits right above it.
- **A 3-2-1 countdown before recording.** It changes when a recording starts, so it's a product decision, not a button.
- **Red on Go Live….** It stays the chrome primary.
- **A round, icon-only Record disc.** Record has one home today, the Studio inspector. Revisit when a second surface needs one.

## Decisions

Taken on 2026-11-01, when the owner asked for the whole plan; each went the proposed way:

1. **Motion while running:** the glow breathes. The alternatives were holding it steady, or flowing a metal ring, which repaints every frame for the whole session.
2. **Idle face:** a deeper red than lit, not today's bright red.
3. **Scope:** the `RecordButton` composite plus the material, not the material alone.
4. **Busy states:** Starting and Stopping light the button without dimming it.

## Revision

On 2026-11-01, after the first version shipped, the owner turned down its look: a red LED lens set in a 2px bezel of the chromatic ring's metal. They asked for:

- **Metallic red with no outline.** The bezel, its rim and the lens's dome and rim light are gone; the face is red metal cut to the edge, polished the way `chrome-fill` is.
- **One width through every state.** The first version followed its words, so Record grew by half when it turned into "Stop recording". `RecordButton` now lays out every state's words in one cell and takes them in `labels` instead of `children`.
