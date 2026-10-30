# 003 — Conventions

How a videorc/ui item is written, documented and registered. Read this with [`001-videorc-ui-library.md`](./001-videorc-ui-library.md); Button (`components/ui/button.tsx`, `components/examples/button-*.tsx`, `content/docs/components/button.mdx`) is the reference implementation of every rule below.

## Sources

- **The extraction source is Videorc `origin/main`.** Never read the local `~/projects/videorc` working tree, which is often on an old branch. Read files with `git -C ~/projects/videorc show origin/main:<path>`, or from the snapshot at the pinned SHA when one is provided.
- **Start from base-rhea, then re-apply Videorc.** Run `pnpm exec shadcn add <name> --overwrite` to get the stock base-rhea file. Then carry over every Videorc customisation from Videorc's Radix copy: classes, variants, sizes, extra props, extra exports and comments that explain a decision.
  - Videorc's comments cite internal plan numbers ("plan 208 S4"). Keep the reason and drop the plan number.

## Component code

- **Imports:**
  - `cn` from `@/lib/utils`, never the `cn` package.
  - Icons from `@/components/icons` by meaning (`ChevronDownIcon`, `CheckIcon`, `CloseIcon`), never from `@phosphor-icons/react`. If a meaning is missing, add a slot to `components/icons.tsx`.
  - Other items through `@/components/ui/*`, `@/components/*`, `@/lib/*`, `@/hooks/*`.
  - No `next/*` anywhere in registry code, and no `window.videorc`. Electron state comes in through props.
- **Keep shadcn's shape:**
  - function declarations
  - `data-slot` on every part
  - one `export { … }` list at the end
- **`"use client"`:** put the directive in a file exactly when the stock base-rhea file has it, and add it when the file uses hooks or browser APIs.
  - A file that exports a `cva` helper used from server code (such as `buttonVariants`) must not be a client module.
- **Base UI APIs:**
  - `asChild` → `render={<X />}`; add `nativeButton={false}` when the rendered element isn't a button.
  - **Radix attribute** selectors → Base UI's attributes:
    - `data-[state=open]` → `data-open`
    - `data-[state=closed]` → `data-closed`
    - `data-[state=checked]` → `data-checked`
    - `data-[state=unchecked]` → `data-unchecked`
    - `data-[state=active]` → `data-active`
    - `data-[disabled]` → `data-disabled`
    - `data-[highlighted]` → `data-highlighted`
    - `data-[side=…]` stays as it is.
  - **Select:** `items` on the root, the placeholder is a `{ value: null }` item, and `alignItemWithTrigger={false}` replaces `position="popper"`.
  - **ToggleGroup:** array values and `multiple`. **Slider:** a scalar for one thumb. **Accordion:** `multiple` and an array `defaultValue`.
  - **Popups** use `Portal` → `Positioner` → `Popup`. Positioning props (`side`, `align`, `sideOffset`) go on the Positioner. Base-rhea's stock file already does this; keep it.
- **Videorc's tokens:**
  - **Radius:** `rounded-panel` (12 px: containers, dialogs), `rounded-row` (8 px: rows, cards), `rounded-chip` (6 px: controls, chips). Replace base-rhea's `rounded-2xl` / `rounded-3xl` / `rounded-4xl` with the right tier.
  - **Floating surfaces:**
    - `glass-float` for menus, selects, popovers, hover cards and toasts
    - `glass-float-dialog` for dialogs and the palette
    - `glass-float-tooltip` for tooltips
    - Never `bg-popover` plus a ring or shadow, and never `backdrop-filter`.
  - **Chrome materials:**
    - `chrome-fill` for the primary fill, a checked control and a range
    - `chrome-plate` for selected or active
    - `chrome-bead` for thumbs and knobs
    - `chrome-led` for record
  - **Chips:** `glass-chip`, `glass-chip-tinted` with a `tone-*`, `glass-dot`, `glass-keycap`.
  - **Text tiers:** `text-foreground`, `text-muted-foreground`, `text-subtle`. Type sizes: `text-label` (11), `text-section` (13), `text-meta` (12).
  - **Desktop scale:** `h-control` / `size-control` (28 px), `h-row` (32 px), `h-row-compact` (28 px), `h-toolbar` (40 px), `h-status-bar` (26 px), `px-gutter` (16 px).
  - **Motion:** 100–150 ms ease-out. No bounce and no translate-on-press.
- **Keep Videorc's behaviour fixes**, and say why in a comment. Examples:
  - menus and selects stop wheel propagation and use `overscroll-contain`
  - a dialog has no backdrop blur
  - `CommandDialog` wraps its children in `Command`
  - sonner's `closeButton` is on by default

## Copy (examples and docs)

Videorc's `docs/ui-copy.md`:

- Sentence case everywhere: "Save local recording". Capitalise names only: Videorc, Go Live (the action), Studio, Sources, YouTube, Twitch, macOS.
- One "…" character, never "...". Use it on a command that asks for more ("Rename…", "Go Live…") and on pending labels ("Saving…").
- Use contractions and American English. **No em dashes** in UI copy.
- Say "Choose", not "Select". Delete destroys; Remove takes something out of a list.
- Write examples in Videorc's domain: scenes, sources, destinations, recordings, cameras, microphones, livestreams, markers.

## Examples

- One file per example, `components/examples/<item>-<what>.tsx`, with `"use client"` and a **default export**. The first one is `<item>-demo.tsx`.
- Import only registry items and React. No site code, no `next/*`, no data fetching. Interactive state is `useState`.
- `pnpm examples:build` regenerates `components/docs/example-registry.tsx`. The integrator runs it; agents working in parallel don't.

## Docs page

`content/docs/<section>/<item>.mdx`. The slug equals the registry item name (a test enforces this). Sections are `components` (`components/ui/*`), `primitives` (`components/*.tsx`), `hooks` (hooks and libs) and `concepts`.

Use this order, and leave out any section that has nothing to say:

1. Frontmatter: `title` (Title Case name), `description` (one sentence on what it is and what makes it Videorc's).
2. `<ComponentPreview name="<item>-demo" />`
3. `## Installation`: a ` ```npm ` fence with `npx shadcn@latest add @videorc/<item>`.
4. `## Usage`: the import fence, then a minimal tsx fence.
5. `## Anatomy`, for compound components: the JSX tree.
6. `## Examples`: `### <Title>`, one or two sentences on when to use it, then `<ComponentPreview name="…" />`. Anchors come from these headings.
7. `## Theming`: a table of the tokens, utilities and `data-*` attributes it styles with.
8. `## Keyboard`, for interactive widgets: a table of keys.
9. `## Accessibility`: what it labels, announces, focuses.
10. `## API reference`: "Every [Base UI X](https://base-ui.com/react/components/x) prop, plus:", then `<PropsTable rows={[[name, type, default | null, description | null], …]} />`, with one `###` per part when the parts take their own props.

## Registry entry

```json
{
  "name": "button",
  "type": "registry:ui",
  "title": "Button",
  "description": "One or two sentences, plain text.",
  "dependencies": ["@base-ui/react", "class-variance-authority"],
  "registryDependencies": ["@videorc/theme", "@videorc/icons", "utils"],
  "files": [{ "path": "components/ui/button.tsx", "type": "registry:ui" }]
}
```

- **Types:**
  - `registry:ui` for `components/ui/*`
  - `registry:component` for primitives in `components/*`
  - `registry:hook` for `hooks/*`
  - `registry:lib` for `lib/*`
- **`registryDependencies`:**
  - every `registry:ui` and `registry:component` lists `@videorc/theme`
  - every item it imports is listed as `@videorc/<name>`
  - `utils` (the stock shadcn item) when it imports `cn`
  - a bare name only for a stock shadcn item we don't ship ourselves
- **`dependencies`:** every npm package the files import, without versions.
- **Agents working in parallel** don't edit `registry.json`. They write their items to the JSON fragment file they were given; the integrator merges fragments with `node scripts/add-items.mjs <file>`.

## Verification

Agents working in parallel share one working tree, so they check only their own files:

- `pnpm exec ultracite fix <files>`, then `pnpm exec ultracite check <files>`
- `pnpm exec tsc --noEmit 2>&1 | grep -E '<their files>'`. Other files may be mid-edit by someone else.
- `pnpm exec vitest run <their test files>`, for ported tests.

The integrator runs the full gate before each commit: `pnpm build`, `pnpm test`, `pnpm check`, `pnpm test:e2e` and `pnpm test:install`.
