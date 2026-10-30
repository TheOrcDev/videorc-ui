# Third-party notices

videorc/ui builds on the following MIT-licensed work.

## shadcn/ui

Every component in `components/ui/` starts from the shadcn/ui `base-rhea` style before Videorc's changes are applied. https://github.com/shadcn-ui/ui

```text
MIT License

Copyright (c) 2023 shadcn
```

## audiocn

`components/ui/fader.tsx` and `components/ui/parameter-slider.tsx` are forks of audiocn's Fader and Parameter Slider with Videorc's Liquid Chrome styling. `components/ui/db-scale.tsx`, `hooks/use-audio-config.tsx` and `lib/audio/*` are audiocn's own files, copied unchanged so the docs site can render the forks; the registry installs them from `@audiocn`. https://audiocn.dev

```text
MIT License

Copyright (c) 2026 OrcDev
```

## Code Block Command

`components/code-block-command.tsx`, `components/copy-button.tsx`, `components/icon-swap.tsx`, `components/tabs.tsx` and `hooks/use-copy-to-clipboard.ts` come from Chánh Đại's registry (https://chanhdai.com) by way of audiocn. They are part of the docs site, not the registry.

```text
MIT License

Copyright (c) 2026 Chánh Đại
```

## The home page hero

`components/home/hero-chrome.tsx` and `lib/hero-chrome/*` are Videorc's first-run Liquid Chrome backdrop, copied for the docs site's home page only; they are not part of the registry. Its shader is ported from React Bits by David Haz (https://reactbits.dev) and used in Videorc with the author's permission.

## Phosphor Icons

`components/icons.tsx` names its slots over Phosphor's glyphs. https://phosphoricons.com

```text
MIT License

Copyright (c) 2020 Phosphor Icons
```

## Base UI

The components are built on Base UI. https://base-ui.com

```text
MIT License

Copyright (c) 2025 Base UI contributors
```

Each MIT licence above carries the same permission notice and warranty disclaimer as this repository's `LICENSE`.
