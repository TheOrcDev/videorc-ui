# 006 — Copper Go Live

Status: planned and built 2026-11-15, waiting for the owner's look check. Videorc's side is its plan 240 (resync, then the Studio transport and the Go Live dialog).

- **Videorc:** `origin/main`. Go Live lives in `components/studio/session-panel.tsx` (`SessionTransport`) as `Button variant="default"`, the chrome primary.
- **videorc-ui:** `main` @ `ef2b3a0`.

## Goal

Give Go Live a metal of its own: **polished copper**. Today Go Live wears `chrome-fill`, the same silver as the sidebar's Studio slab, so the two biggest buttons in the app look alike. Record already has metallic red. Copper sits between the silver and the red, so it reads as "this one is important" without looking like a second Record.

## The material: `chrome-copper`

| Part | What it is |
| --- | --- |
| **Face** | Polished copper in the fill's five-band shape: a bright top band, a darker waist just below the middle, and the light coming back at the foot. A light line along the top edge, a dark line along the bottom, a small drop. No border and no ring. |
| **Ink** | A deep copper-brown (`oklch(0.2 0.04 45)`), not white. Dark ink on bright metal is how the silver fill reads in dark mode, and it keeps copper clearly apart from Record's white-on-red. |
| **Hover** | Lifts (a faint white wash), like `chrome-fill`. |
| **Pressed** | Concave: the gradient flips and the drop becomes an inner shade. No translate. |
| **Busy** (`aria-disabled`) | Stays copper, takes no hover. |
| **Disabled** | Flat copper at 50% (Button's `disabled:opacity-50`), no bands. |

### Rules it keeps

- **The same copper in both themes.** Silver flips to black chrome in light mode because silver disappears on porcelain; copper doesn't, so it stays copper. Light mode gets a softer drop, as every chrome material does.
- **The label passes AA on every band.** `styles/chrome-copper.test.ts` checks the ink against every stop in both themes at 4.5:1 or better. The darkest band (the waist) is the tight one, so it stays at OKLCH lightness 0.62 or above.
- **Still.** No glow and no motion. Red's breathing glow is Record's tally light; Go Live doesn't get a second one. `chrome-copper` is on the still-materials list.
- **Increase Contrast** adds `--chrome-edge`, as every chrome material does.
- **Copper is Go Live's alone.** Like red for Record, it means one thing: this button starts or ends the livestream. Never on panels, rows, badges or text.

## API

### Button `variant="go-live"`

`chrome-copper border-0`, so its light and shade reach the edge and the focus ring still draws. For Go Live's buttons only: the Studio transport and the Go Live dialog's start button.

### `GoLiveButton` (primitive)

A thin composite, the twin of `RecordButton`:

```tsx
<GoLiveButton
  labels={{ live: "End livestream" }}
  onClick={state === "idle" ? openGoLive : endLivestream}
  state={state}
/>
```

- `state`: `"idle" | "checking" | "live" | "stopping"`.
- Default words: "Go Live", "Checking…", "End livestream", "Stopping…" (Videorc's `go-live-copy.ts` and `session-stop.ts`). `labels` overrides any of them.
- Glyph: `LivestreamIcon` while idle and checking, `StopIcon` once live.
- `checking` and `stopping` are busy: `aria-disabled` through Base UI's `focusableWhenDisabled`, so focus stays and nothing dims. The copper is the feedback.
- Every state's words share one grid cell, so the button keeps one width.
- No `aria-pressed`: it's a one-shot action whose words change. The session status announces the change.

## Slices

1. **The material.** `styles/videorc.css`: `--chrome-copper-*` tokens in both themes, `--chrome-copper-shadow`, `@utility chrome-copper`, and the materials comment. `styles/chrome-copper.test.ts` (tokens in both themes, ink contrast, still, no border). `pnpm theme:build`.
2. **The variant.** `components/ui/button.tsx`: `go-live`. `button.test.tsx` and the Button docs list it. `components/ui/kbd.tsx`: a shortcut chip inside `go-live` takes the button's own ink, as it does in the other filled buttons (the Go Live dialog's start button carries one).
3. **The composite.** `components/go-live-button.tsx` and its test; examples `go-live-button-demo` and `go-live-button-states` (every state, both sizes); `record-button-transport` now uses `GoLiveButton` and both pages show it; `content/docs/primitives/go-live-button.mdx`; a social card; `registry.json`; `pnpm registry:build`.
4. **Videorc** (its plan 240): `pnpm ui:sync button kbd go-live-button`, port the CSS into Videorc's `styles.css`, swap the Studio's Go Live and the dialog's start button, and update the design skill.

## Not doing

- **Copper on the sidebar's Studio slab.** It stays silver; that's the point.
- **A glow or any motion.** Record owns the tally light.
- **The Retro LCD look.** Its outlined keys are a different look, not this button.
- **Copper anywhere else** (badges, the Go Live dialog's title, destinations). One button, one meaning.
