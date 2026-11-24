import { ServerCodeBlock } from "fumadocs-ui/components/codeblock.rsc";
import type { ReactNode } from "react";

import { codeThemes } from "@/lib/docs/code-themes";
import {
  cargoLines,
  galleryShots,
  galleryUsage,
  gpuiClosure,
  gpuiItemUrl,
  moduleDoc,
} from "@/lib/docs/gpui";
import type { GpuiItem } from "@/lib/docs/gpui";
import { readSource } from "@/lib/docs/read-source";

const INLINE = /(\[`[^`]+`\]|`[^`]+`)/gu;
const LIST_ITEM = /^- /u;
const CONTINUATION = /^ {2}/u;
/** The kit's own `init`, from gpui/kit/src/lib.rs. */
const INIT = `pub fn init(cx: &mut gpui::App) {
    gpui_base::LayoutDirection::Ltr.set_global(cx);
    gpui_base::init(cx);
}`;

/** `code` and rustdoc's [`link`] as inline code; the rest as text. */
const inline = (text: string): ReactNode[] =>
  text.split(INLINE).map((part, index) => {
    const code = part.startsWith("[`")
      ? part.slice(2, -2)
      : part.startsWith("`")
        ? part.slice(1, -1)
        : undefined;
    // oxlint-disable-next-line react/no-array-index-key -- a fixed split of one string.
    return code === undefined ? part : <code key={index}>{code}</code>;
  });

/** A module's `//!` header: paragraphs and `- ` lists. */
const Prose = ({ text }: { text: string }) => (
  <>
    {text.split("\n\n").map((block) => {
      const lines = block.split("\n");
      if (lines[0] && LIST_ITEM.test(lines[0])) {
        const entries: string[] = [];
        for (const line of lines) {
          if (LIST_ITEM.test(line)) {
            entries.push(line.replace(LIST_ITEM, ""));
          } else {
            entries[entries.length - 1] += ` ${line.replace(CONTINUATION, "")}`;
          }
        }
        return (
          <ul key={block}>
            {entries.map((entry) => (
              <li key={entry}>{inline(entry)}</li>
            ))}
          </ul>
        );
      }
      return <p key={block}>{inline(lines.join(" "))}</p>;
    })}
  </>
);

interface GpuiDocsProps {
  item: GpuiItem;
}

/**
 * A component page's GPUI tab (Videorc plan 260, S2.2b): what the GPUI
 * twin is, how to install it, the gallery's shots, the gallery page as its
 * usage, and its source.
 */
export const GpuiDocs = async ({ item }: GpuiDocsProps) => {
  const closure = gpuiClosure(item);
  const rustFiles = item.files.filter((file) => file.path.endsWith(".rs"));
  const [overview, usage, shots, sources] = await Promise.all([
    rustFiles[0] ? moduleDoc(rustFiles[0].path) : Promise.resolve(""),
    galleryUsage(item.name),
    galleryShots(item.name),
    Promise.all(
      rustFiles.map(async (file) => ({
        code: await readSource(file.path),
        file,
      }))
    ),
  ]);
  const files = closure.flatMap((entry) =>
    entry.files.map((file) => file.target)
  );
  const modules = [
    ...new Set(
      closure.flatMap((entry) =>
        entry.files
          .filter((file) => file.target.startsWith("src/"))
          .map((file) => file.target.slice("src/".length, -".rs".length))
      )
    ),
  ].sort();
  const patches = item.meta.patches ?? [];

  return (
    <>
      <Prose text={overview} />

      <h2>Installation</h2>
      <p>
        In Videorc, sync it into <code>crates/videorc-kit</code>; the sync
        formats the files with rustfmt, and <code>pnpm ui:check</code> fails
        when a synced file is edited there.
      </p>
      <ServerCodeBlock
        code={`pnpm ui:sync --flavour gpui ${item.name}`}
        lang="bash"
        themes={codeThemes}
      />
      <p>
        Elsewhere, copy the files of{" "}
        <a href={gpuiItemUrl(item.name)}>its registry item</a> and its
        dependencies into a crate of your own ({files.length} files, each to
        its <code>target</code>), and give it a <code>lib.rs</code> that
        declares the modules and sets up gpui-base before the first window
        opens. The crate needs these dependencies, pinned exactly as the kit
        pins them:
      </p>
      <ServerCodeBlock
        code={`// lib.rs\n${modules.map((module) => `pub mod ${module};`).join("\n")}\n\n${INIT}`}
        lang="rust"
        themes={codeThemes}
      />
      <ServerCodeBlock
        code={`[dependencies]\n${cargoLines(closure)}`}
        lang="toml"
        themes={codeThemes}
      />
      {patches.length > 0 && (
        <p>
          The kit builds with a patched copy of {patches.join(", ")} through
          the workspace&apos;s <code>[patch.crates-io]</code> (videorc-ui&apos;s{" "}
          <code>gpui/patches/</code>): without it, weight 500 draws SF
          Regular instead of SF Medium on macOS.
        </p>
      )}

      <h2>Gallery</h2>
      {shots ? (
        <div className="not-prose my-4 overflow-hidden rounded-panel border">
          <img
            alt={`${item.title} in the GPUI gallery, light`}
            className="block w-full dark:hidden"
            src={shots.light}
          />
          <img
            alt={`${item.title} in the GPUI gallery, dark`}
            className="hidden w-full dark:block"
            src={shots.dark}
          />
        </div>
      ) : (
        <p>
          No shot yet: the gallery&apos;s shots are taken on a macOS runner.
          Run it with <code>cargo run -p videorc-gallery -- --item {item.name}</code>{" "}
          in <code>gpui/</code>.
        </p>
      )}

      {usage && (
        <>
          <h2>Usage</h2>
          <p>
            The gallery&apos;s page for it, <code>{usage.file}</code>, which
            builds with the kit. Each function takes the appearance it draws
            in; an app leaves it out and the window&apos;s appearance applies.
          </p>
          <ServerCodeBlock code={usage.code} lang="rust" themes={codeThemes} />
        </>
      )}

      <h2>Source</h2>
      {sources.map(({ code, file }) => (
        <div className="[&_pre]:max-h-[28rem]" key={file.path}>
          <ServerCodeBlock
            code={code}
            codeblock={{ title: file.path }}
            lang="rust"
            themes={codeThemes}
          />
        </div>
      ))}
    </>
  );
};
