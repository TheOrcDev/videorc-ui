# videorc/ui

The component library behind [Videorc](https://videorc.com), the AI-native recording and livestreaming studio. Liquid Chrome surfaces, glass chips, desktop-sized controls and the shared primitives every Videorc screen is built from, on Base UI, shipped as a [shadcn registry](https://ui.shadcn.com/docs/registry).

**Docs:** https://ui.videorc.com

## Use it

Add the registry to `components.json`, then add components with the shadcn CLI:

```json
{
  "registries": {
    "@videorc": "https://ui.videorc.com/r/{name}.json",
    "@audiocn": "https://audiocn.dev/r/{name}.json"
  }
}
```

```bash
npx shadcn@latest add @videorc/theme
npx shadcn@latest add @videorc/button @videorc/command @videorc/list-row
```

`@audiocn` is only needed for the audio controls (Fader, Parameter Slider), which build on audiocn's core.

## How it's built

One Next.js app is the docs site, the registry source and the component source.

| Path | What it is |
| --- | --- |
| `components/ui/` | Components: shadcn/ui on Base UI with Videorc's changes, and Videorc's own controls |
| `components/*.tsx` | Primitives: panes, rows, status bars, menus, dialogs |
| `components/icons.tsx` | The semantic icon set |
| `hooks/`, `lib/` | Shared hooks and helpers |
| `styles/videorc.css` | The theme, the source of truth for the `theme` item |
| `styles/desktop.css` | The desktop base, the source of the `desktop` item |
| `components/examples/` | One file per live example |
| `content/docs/` | The docs, one page per item |
| `registry.json` | The registry; `pnpm registry:build` writes `public/r/` |
| `plans/` | The library plan, the inventory, conventions and the audiocn forks |

Components are extracted from Videorc's `origin/main` and ported to Base UI. From then on they change here first, and Videorc pulls them with the shadcn CLI. `plans/003-conventions.md` is the rulebook for a new item.

## Develop

```bash
pnpm install
pnpm dev            # docs site on http://localhost:3000, registry at /r
pnpm test           # unit tests (vitest)
pnpm check          # lint and format (Ultracite)
pnpm typecheck
pnpm build          # examples, theme check, registry, site
pnpm test:e2e       # every docs page in Chrome (after a build)
pnpm test:install   # installs every item into a Next app and a Vite app, then type-checks
pnpm theme:build    # regenerate the theme items from styles/*.css
```

## Licence

MIT for the code. The Videorc name, logo and brand imagery are not covered; see `LICENSE` and `THIRD_PARTY_NOTICES.md`.
