import { access, readFile } from "node:fs/promises";
import path from "node:path";

import registryGpui from "@/registry-gpui.json";
import { galleryPages } from "@/scripts/lib/gpui-registry.mjs";

/** One GPUI item as registry-gpui.json holds it (Videorc plan 260, S2.2b). */
export interface GpuiItem {
  name: string;
  title: string;
  description: string;
  files: { path: string; target: string; type: string }[];
  registryDependencies?: string[];
  meta: {
    crates: Record<string, Record<string, string | boolean>>;
    patches?: string[];
  };
}

const items = registryGpui.items as unknown as GpuiItem[];
const byName = new Map(items.map((item) => [item.name, item]));

/** The GPUI twin of a React item, if the GPUI flavour has one. */
export const getGpuiItem = (name: string): GpuiItem | undefined =>
  byName.get(name);

export const GPUI_NAMESPACE = "@videorc-gpui";
export const gpuiItemUrl = (name: string): string =>
  `https://ui.videorc.com/r/gpui/${name}.json`;

const fromRoot = (relativePath: string) =>
  path.join(
    // Turbopack reads this hint and skips tracing the whole project.
    // oxlint-disable-next-line no-inline-comments
    /* turbopackIgnore: true */ process.cwd(),
    relativePath
  );

const exists = async (relativePath: string): Promise<boolean> => {
  try {
    await access(fromRoot(relativePath));
    return true;
  } catch {
    return false;
  }
};

const DOC_LINE = /^\/\/!(?: |$)/u;

/** A module's `//!` header as Markdown-ish text: what the item is. */
export const moduleDoc = async (relativePath: string): Promise<string> => {
  const source = await readFile(fromRoot(relativePath), "utf-8");
  const lines: string[] = [];
  for (const line of source.split("\n")) {
    if (!DOC_LINE.test(line)) {
      break;
    }
    lines.push(line.replace(DOC_LINE, ""));
  }
  return lines.join("\n").trim();
};

/** The closing brace of a top-level `fn`: a line that is exactly `}`. */
const FN_END = "\n}\n";

/**
 * The gallery's page function for an item, with the doc comment above it:
 * code that builds with the kit, so the usage the docs show cannot drift.
 */
export const galleryUsage = async (
  name: string
): Promise<{ code: string; file: string } | undefined> => {
  const main = await readFile(fromRoot("gpui/gallery/src/main.rs"), "utf-8");
  const page = galleryPages(main)[name];
  if (!page) {
    return undefined;
  }
  const source = await readFile(fromRoot(page.file), "utf-8");
  const start = source.search(new RegExp(`^(?:pub(?:\\(crate\\))? )?fn ${page.fn}\\(`, "mu"));
  if (start === -1) {
    return undefined;
  }
  let from = start;
  const before = source.slice(0, start).split("\n");
  before.pop();
  while (before.length > 0 && before.at(-1)?.startsWith("///")) {
    from -= (before.pop()?.length ?? 0) + 1;
  }
  const end = source.indexOf(FN_END, start);
  return {
    code: source.slice(from, end === -1 ? undefined : end + 2),
    file: page.file,
  };
};

/** The committed gallery shots, dark and light, when both exist. */
export const galleryShots = async (
  name: string
): Promise<{ dark: string; light: string } | undefined> => {
  const dark = `/gpui/shots/${name}-dark.png`;
  const light = `/gpui/shots/${name}-light.png`;
  const both = await Promise.all([
    exists(`public${dark}`),
    exists(`public${light}`),
  ]);
  return both.every(Boolean) ? { dark, light } : undefined;
};

const tomlValue = (value: string | boolean) =>
  typeof value === "string" ? JSON.stringify(value) : String(value);

/** The `[dependencies]` lines a crate needs for the item and its dependencies. */
export const cargoLines = (closure: GpuiItem[]): string => {
  const crates = new Map<string, Record<string, string | boolean>>();
  for (const item of closure) {
    for (const [name, spec] of Object.entries(item.meta.crates)) {
      crates.set(name, spec);
    }
  }
  return [...crates.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([name, spec]) => {
      const pairs = Object.entries(spec).map(
        ([key, value]) => `${key} = ${tomlValue(value)}`
      );
      return pairs.length === 1 && spec.version
        ? `${name} = ${tomlValue(spec.version)}`
        : `${name} = { ${pairs.join(", ")} }`;
    })
    .join("\n");
};

/** The item and every GPUI item it depends on, the item first. */
export const gpuiClosure = (item: GpuiItem): GpuiItem[] => {
  const seen: GpuiItem[] = [];
  const visit = (current: GpuiItem) => {
    if (seen.includes(current)) {
      return;
    }
    seen.push(current);
    for (const dependency of current.registryDependencies ?? []) {
      const next = byName.get(dependency.slice(GPUI_NAMESPACE.length + 1));
      if (next) {
        visit(next);
      }
    }
  };
  visit(item);
  return seen;
};
