# 002 — Inventory

Every v1 candidate in Videorc's renderer, read from `origin/main` at `8a8f3e98efe0383a3c0b49eef37272fb76a2152e`. The data comes from a script that counts lines, call sites (other renderer modules importing the file), npm imports, local imports and any `window.videorc` use. Tests are excluded.

**Status** says what happens to the item:

- _extract_: port as is.
- _needs adapter_: app coupling becomes props first.
- _fork if changed_: for audiocn components, which are forked only where Videorc's copy differs from audiocn's.
- _skip_: stays in Videorc.

No v1 candidate calls `window.videorc`. Radix appears only in `ui/*` and `media-card` (through `Slot`).

| Item | Family | Lines | Call sites | npm imports | Status |
| --- | --- | --: | --: | --- | --- |
| `ui/button` | Display | 66 | 0 | – | done |
| `ui/dropdown-menu` | Overlays | 271 | 0 | – | extract |
| `ui/empty` | Display | 101 | 0 | – | extract |
| `ui/sonner` | Overlays | 46 | 0 | – | extract |
| `ui/tabs` | Toggles and keys | 82 | 0 | – | extract |
| `ui/tooltip` | Overlays | 65 | 0 | – | extract |
| `icons` | Foundation | 289 | 0 | – | done |

## Families

Each family is ported by one agent, following `003-conventions.md`, in parallel with the others.

| Family | Items | Depends on |
| --- | --- | --- |
| Overlays | tooltip, popover, hover-card, dropdown-menu, context-menu, select, dialog, alert-dialog, command, sonner | icons, button |
| Forms | input, textarea, input-group, label, field (+ field-context), checkbox, switch, slider | icons, button, separator |
| Toggles and keys | toggle, toggle-group, tabs (+ tabs-variants), segmented-control, progress, kbd, shortcut-keys, shortcut-tooltip | field-context, tooltip, platform |
| Display | alert, badge, avatar, empty, skeleton, spinner, separator, scroll-area, accordion, collapsible, info-tooltip, disabled-reason, chrome-row, chart | icons, tooltip |
| Primitives | every _extract_ and _needs adapter_ row in `components/` | all of the above |
| audiocn forks | fader, level-meter, mixer, parameter-slider, lcd-display, lcd-meter, sound-pad, db-readout, db-scale, channel-toggle, clip-indicator, bar-visualizer, with the audio core (`lib/audio/*`) and its hooks | theme |

## Notes

- **The audiocn components** came from `@audiocn` (Videorc's `components.json` lists it) and were restyled for Liquid Chrome (plan 208) or changed for Buddy (plans 164–174). Their libs (`lib/audio/*`) and hooks (`use-audio-config`, `use-frame-source`, `use-visibility`, `use-clip-hold`, `use-reduced-motion`) are audiocn's. Phase 4 diffs each one against audiocn's current source.
- **`use-reduced-motion`:** Videorc's version (now `@videorc/use-reduced-motion`) exports `useReducedMotion`, the same name audiocn uses, so the two collide. The audiocn forks import ours.
- **`status-word`** (`lib/status-word.ts`, 34 lines) is the status-tone vocabulary StatusBadge and StatusDot share. It ships as a lib item.
- **`lock-alert`** reads `lib/lock-view` (the unlock action for a gate) and `lib/videorc-web-links`. The primitive takes the action as a prop.
