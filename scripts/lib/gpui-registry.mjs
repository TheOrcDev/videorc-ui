// The GPUI flavour's registry (Videorc plan 260, S2.2b): the pure parts of
// scripts/build-gpui-registry.mjs.
//
// registry-gpui.json is written by hand only for each item's name, title,
// description and the paths of its files. Everything a consumer depends on
// is computed from the sources here, so it cannot drift:
// - each file's `type` and `target` (relative to the kit crate's root);
// - `registryDependencies`, from the `crate::<module>` paths each file uses;
// - `meta.crates`, the crates each item's files use, with the kit
//   workspace's exact pins from gpui/Cargo.toml, and `meta.patches`.
// The twin check holds the flavours together: every GPUI item has a React
// item of the same name, and an item's variants and sizes are the React
// twin's.

export const NAMESPACE = "@videorc-gpui";
export const KIT = "gpui/kit/";
export const SCHEMA_ITEM = "https://ui.shadcn.com/schema/registry-item.json";

const ITEM_NAME = /^[a-z0-9]+(?:-[a-z0-9]+)*$/u;
const RUST_FILE = /^gpui\/kit\/src\/([a-z0-9_]+)\.rs$/u;
const KIT_FILE = /^gpui\/kit\/(?:src\/[a-z0-9_]+\.rs|icons\/[a-z0-9-]+\.svg)$/u;
const LINE_COMMENT = /\/\/[^\n]*/gu;
const BLOCK_COMMENT = /\/\*[\s\S]*?\*\//gu;
const IDENT = /[A-Za-z_][A-Za-z0-9_]*/uy;
const CRATE_PATH = /\bcrate::([a-z_][a-z0-9_]*)\b/gu;
const USE_CRATE_GROUP = /\buse\s+crate::\{/gu;
const SECTION = /^\s*\[([^\]]+)\]\s*$/u;
const DEPENDENCY_LINE = /^([A-Za-z0-9_-]+)\s*=\s*(.+?)\s*$/u;
const INLINE_PAIR = /([A-Za-z0-9_-]+)\s*=\s*("(?:[^"\\]|\\.)*"|true|false)/gu;
const PASCAL_WORD = /[A-Z][a-z0-9]*/gu;
const ENUM_BLOCK = /\bpub\s+enum\s+([A-Z][A-Za-z0-9]*)\s*\{([^}]*)\}/gu;
const ENUM_VARIANT = /^\s*([A-Z][A-Za-z0-9]*)\s*,?\s*$/u;
const ATTRIBUTE = /#\[[^\]]*\]/gu;
const CVA_KEY = /^(?:([A-Za-z_$][\w$]*)|"([^"]+)"|'([^']+)')\s*:/u;

/** `scroll_area` for `scroll-area`. */
export const moduleFor = (name) => name.replaceAll("-", "_");

/** Rust source with its comments blanked, so a path in a doc never counts. */
export const withoutComments = (source) =>
  source.replaceAll(BLOCK_COMMENT, " ").replaceAll(LINE_COMMENT, " ");

/**
 * The idents at the top level of a `{…}` group that starts at `open` (the
 * index of the brace): `chrome::{self, X}, theme::Y, tokens` gives chrome,
 * theme and tokens.
 */
const groupHeads = (source, open) => {
  const heads = [];
  let depth = 0;
  let expectHead = true;
  for (let index = open; index < source.length; index += 1) {
    const char = source[index];
    if (char === "{") {
      depth += 1;
      expectHead = depth === 1;
      continue;
    }
    if (char === "}") {
      depth -= 1;
      if (depth === 0) {
        return heads;
      }
      continue;
    }
    if (depth === 1 && char === ",") {
      expectHead = true;
      continue;
    }
    if (depth === 1 && expectHead && /[A-Za-z_]/u.test(char)) {
      IDENT.lastIndex = index;
      const [ident] = IDENT.exec(source);
      heads.push(ident);
      index += ident.length - 1;
      expectHead = false;
    }
  }
  return heads;
};

/** The kit modules a Rust file uses through `crate::`. */
export const crateModules = (source) => {
  const code = withoutComments(source);
  const modules = new Set();
  for (const match of code.matchAll(CRATE_PATH)) {
    modules.add(match[1]);
  }
  for (const match of code.matchAll(USE_CRATE_GROUP)) {
    for (const head of groupHeads(code, match.index + match[0].length - 1)) {
      if (head !== "self") {
        modules.add(head);
      }
    }
  }
  return [...modules].sort();
};

/** The external crates (of `known`) a Rust file names. */
export const externalCrates = (source, known) => {
  const code = withoutComments(source);
  return known.filter((name) => new RegExp(`\\b${name}::`, "u").test(code));
};

const unquote = (value) =>
  value.startsWith('"') ? JSON.parse(value) : value === "true";

/**
 * `[workspace.dependencies]` and `[patch.crates-io]` from gpui/Cargo.toml.
 * Only one-line entries are read; a multi-line one (gpui_platform's
 * features) is skipped, as no kit file uses it.
 *
 * @param {string} text
 * @returns {{ dependencies: Record<string, Record<string, string | boolean>>, patches: string[] }}
 */
export const parseWorkspaceCargo = (text) => {
  /** @type {Record<string, Record<string, string | boolean>>} */
  const dependencies = {};
  /** @type {string[]} */
  const patches = [];
  let section = "";
  for (const line of text.split("\n")) {
    const heading = SECTION.exec(line);
    if (heading) {
      [, section] = heading;
      continue;
    }
    const entry = DEPENDENCY_LINE.exec(line);
    if (!entry || line.trimStart().startsWith("#")) {
      continue;
    }
    const [, name, value] = entry;
    if (section === "patch.crates-io") {
      patches.push(name);
      continue;
    }
    if (section !== "workspace.dependencies") {
      continue;
    }
    if (value.startsWith('"')) {
      dependencies[name] = { version: JSON.parse(value) };
    } else if (value.startsWith("{") && value.endsWith("}")) {
      /** @type {Record<string, string | boolean>} */
      const spec = {};
      for (const pair of value.matchAll(INLINE_PAIR)) {
        spec[pair[1]] = unquote(pair[2]);
      }
      if (!spec.path) {
        dependencies[name] = spec;
      }
    }
  }
  return { dependencies, patches: patches.sort() };
};

/** `ButtonVariant::GoLive` is React's `go-live`. */
export const kebabFromPascal = (word) =>
  (word.match(PASCAL_WORD) ?? [word]).map((part) => part.toLowerCase()).join("-");

/** Every `pub enum Name { … }` in a file with its unit variants, kebab-cased. */
export const rustEnums = (source) => {
  const code = withoutComments(source);
  const enums = new Map();
  for (const match of code.matchAll(ENUM_BLOCK)) {
    const variants = match[2]
      .replaceAll(ATTRIBUTE, " ")
      .split(",")
      .map((part) => ENUM_VARIANT.exec(`${part.trim()},`)?.[1])
      .filter(Boolean)
      .map(kebabFromPascal);
    enums.set(match[1], variants);
  }
  return enums;
};

/** The keys at the top level of the object literal that opens at `open`. */
const objectKeys = (source, open) => {
  const keys = [];
  let depth = 0;
  let atKey = false;
  for (let index = open; index < source.length; index += 1) {
    const char = source[index];
    if (char === '"' || char === "'" || char === "`") {
      if (depth === 1 && atKey && char !== "`") {
        const key = CVA_KEY.exec(source.slice(index));
        if (key) {
          keys.push(key[2] ?? key[3]);
        }
      }
      const close = source.indexOf(char, index + 1);
      index = close === -1 ? source.length : close;
      atKey = false;
      continue;
    }
    if (char === "{" || char === "[" || char === "(") {
      depth += 1;
      atKey = depth === 1;
      continue;
    }
    if (char === "}" || char === "]" || char === ")") {
      depth -= 1;
      if (depth === 0) {
        return keys;
      }
      continue;
    }
    if (depth === 1 && char === ",") {
      atKey = true;
      continue;
    }
    if (depth === 1 && atKey && /[A-Za-z_$]/u.test(char)) {
      const key = CVA_KEY.exec(source.slice(index));
      if (key) {
        keys.push(key[1]);
      }
      atKey = false;
    }
  }
  return keys;
};

const stripJsComments = (source) =>
  source.replaceAll(BLOCK_COMMENT, " ").replaceAll(/(^|[^:])\/\/[^\n]*/gu, "$1");

/**
 * A cva's variant groups in a React file: `{ variant: [...], size: [...] }`.
 * A group given as a constant (`size: DIALOG_SIZE_CLASS`) is read from that
 * constant's object literal in the same file.
 *
 * @param {string} source
 * @returns {Record<string, string[]>}
 */
export const reactVariantGroups = (source) => {
  const code = stripJsComments(source);
  /** @type {Record<string, string[]>} */
  const groups = {};
  const at = code.indexOf("variants: {");
  if (at === -1) {
    return groups;
  }
  const open = at + "variants: ".length;
  for (const group of objectKeys(code, open)) {
    const pattern = new RegExp(`\\b${group}:\\s*(\\{|[A-Za-z_$][\\w$]*)`, "u");
    const found = pattern.exec(code.slice(open));
    if (!found) {
      continue;
    }
    if (found[1] === "{") {
      groups[group] = objectKeys(code, open + found.index + found[0].length - 1);
    } else {
      const constant = new RegExp(`\\b${found[1]}\\b[^=]*=\\s*\\{`, "u").exec(code);
      if (constant) {
        groups[group] = objectKeys(code, constant.index + constant[0].length - 1);
      }
    }
  }
  return groups;
};

const sorted = (values) => [...new Set(values)].sort();

/**
 * The twin check for one item: the React twin exists, and each of the GPUI
 * item's `<Name>Variant` and `<Name>Size` enums holds exactly the twin's
 * `variant` and `size` keys. Returns problems as sentences.
 */
export const twinProblems = ({ name, rustSources, reactItem, reactSources }) => {
  if (!reactItem) {
    return [
      `${NAMESPACE}/${name} has no React twin: registry.json has no item "${name}".`,
    ];
  }
  const problems = [];
  const enums = new Map();
  for (const source of rustSources) {
    for (const [enumName, variants] of rustEnums(source)) {
      enums.set(enumName, variants);
    }
  }
  /** @type {Record<string, string[]>} */
  const groups = {};
  for (const source of reactSources) {
    Object.assign(groups, reactVariantGroups(source));
  }
  const pascal = name
    .split("-")
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join("");
  for (const [group, suffix] of [
    ["variant", "Variant"],
    ["size", "Size"],
  ]) {
    const rust = enums.get(`${pascal}${suffix}`);
    const react = groups[group];
    if (!rust && !react) {
      continue;
    }
    if (!rust) {
      problems.push(
        `${name}: React has ${group}s (${sorted(react).join(", ")}) and GPUI has no ${pascal}${suffix}.`
      );
      continue;
    }
    if (!react) {
      problems.push(
        `${name}: GPUI's ${pascal}${suffix} has no React twin (no cva "${group}" in ${reactItem.name}).`
      );
      continue;
    }
    const missing = sorted(react).filter((key) => !rust.includes(key));
    const extra = sorted(rust).filter((key) => !react.includes(key));
    if (missing.length > 0 || extra.length > 0) {
      problems.push(
        `${name}: ${pascal}${suffix} differs from React's ${group}s${missing.length > 0 ? `; GPUI lacks ${missing.join(", ")}` : ""}${extra.length > 0 ? `; React lacks ${extra.join(", ")}` : ""}.`
      );
    }
  }
  return problems;
};

/** Checks the hand-written part of registry-gpui.json; returns problems. */
export const indexProblems = (index, kitModules) => {
  const problems = [];
  const owners = new Map();
  const names = new Set();
  for (const item of index.items ?? []) {
    if (!ITEM_NAME.test(item.name ?? "")) {
      problems.push(`"${item.name}" is not a registry item name (kebab-case).`);
      continue;
    }
    if (names.has(item.name)) {
      problems.push(`${item.name} is listed twice.`);
    }
    names.add(item.name);
    for (const field of ["title", "description"]) {
      if (typeof item[field] !== "string" || item[field].length === 0) {
        problems.push(`${item.name} needs a ${field}.`);
      }
    }
    if (!Array.isArray(item.files) || item.files.length === 0) {
      problems.push(`${item.name} has no files.`);
      continue;
    }
    for (const file of item.files) {
      if (!KIT_FILE.test(file.path ?? "")) {
        problems.push(
          `${item.name}: ${file.path} is not a kit source (gpui/kit/src/*.rs or gpui/kit/icons/*.svg).`
        );
        continue;
      }
      const owner = owners.get(file.path);
      if (owner) {
        problems.push(`${file.path} is in both ${owner} and ${item.name}.`);
      }
      owners.set(file.path, item.name);
    }
  }
  for (const module of kitModules) {
    const path = `${KIT}src/${module}.rs`;
    if (module !== "lib" && !owners.has(path)) {
      problems.push(
        `${path} is in no item: add it to an item in registry-gpui.json.`
      );
    }
  }
  return problems;
};

/** The module a kit file defines, or null for an icon. */
export const moduleOfPath = (path) => RUST_FILE.exec(path)?.[1] ?? null;

/**
 * The computed fields of every item: file types and targets, the items its
 * files depend on, and the crates they use with the kit's pins. `read` maps
 * a repo path to its text.
 */
export const completeIndex = (index, { read, cargo }) => {
  const moduleOwner = new Map();
  for (const item of index.items) {
    for (const file of item.files) {
      const module = moduleOfPath(file.path);
      if (module) {
        moduleOwner.set(module, item.name);
      }
    }
  }
  const known = Object.keys(cargo.dependencies).filter(
    (name) => !cargo.dependencies[name].path
  );
  const problems = [];
  const items = index.items.map((item) => {
    const dependencies = new Set();
    const crates = new Set();
    for (const file of item.files) {
      if (!file.path.endsWith(".rs")) {
        continue;
      }
      const source = read(file.path);
      for (const module of crateModules(source)) {
        const owner = moduleOwner.get(module);
        if (!owner) {
          problems.push(
            `${file.path} uses crate::${module}, which no item ships.`
          );
        } else if (owner !== item.name) {
          dependencies.add(owner);
        }
      }
      for (const name of externalCrates(source, known)) {
        crates.add(name);
      }
    }
    const meta = {
      flavour: "gpui",
      crates: Object.fromEntries(
        [...crates].sort().map((name) => [name, cargo.dependencies[name]])
      ),
    };
    if (cargo.patches.length > 0) {
      meta.patches = cargo.patches;
    }
    const completed = {
      name: item.name,
      type: "registry:lib",
      title: item.title,
      description: item.description,
      files: item.files.map((file) => ({
        path: file.path,
        type: "registry:file",
        target: file.path.slice(KIT.length),
      })),
      meta,
    };
    if (dependencies.size > 0) {
      completed.registryDependencies = [...dependencies]
        .sort()
        .map((name) => `${NAMESPACE}/${name}`);
    }
    return completed;
  });
  return { index: { ...index, items }, problems };
};

const GALLERY_ITEM =
  /Item\s*\{\s*name:\s*"([a-z0-9-]+)",\s*show:\s*(?:([a-z_][a-z0-9_]*)::)?([a-z_][a-z0-9_]*),?\s*\}/gu;

/**
 * The gallery's page for each item, from `ITEMS` in gallery/src/main.rs:
 * `{ button: { file: "gpui/gallery/src/items.rs", fn: "button_page" } }`.
 *
 * @param {string} mainSource
 * @returns {Record<string, { file: string, fn: string }>}
 */
export const galleryPages = (mainSource) => {
  /** @type {Record<string, { file: string, fn: string }>} */
  const pages = {};
  for (const match of mainSource.matchAll(GALLERY_ITEM)) {
    const [, name, module, fn] = match;
    pages[name] = {
      file: `gpui/gallery/src/${module ?? "main"}.rs`,
      fn,
    };
  }
  return pages;
};

/** An item and every item it depends on, through `registryDependencies`. */
export const itemClosure = (index, name) => {
  const byName = new Map(index.items.map((item) => [item.name, item]));
  const seen = [];
  const visit = (current) => {
    if (seen.includes(current) || !byName.has(current)) {
      return;
    }
    seen.push(current);
    for (const dependency of byName.get(current).registryDependencies ?? []) {
      visit(dependency.slice(NAMESPACE.length + 1));
    }
  };
  visit(name);
  return seen.map((entry) => byName.get(entry));
};

/**
 * What an item's shot shows: its files, its dependencies' files (the
 * tokens among them) and the gallery page that draws it. When one changes,
 * the shot is stale.
 */
export const shotSources = (index, name, pages) => {
  const files = itemClosure(index, name).flatMap((item) =>
    item.files.map((file) => file.path)
  );
  if (pages[name]) {
    files.push(pages[name].file);
  }
  return [...new Set(files)].sort();
};

/** Shot check problems, given each item's current and recorded source hash. */
export const shotProblems = ({ items, recorded, current, present, strict }) => {
  const problems = [];
  const missing = [];
  for (const name of items) {
    if (!present(name)) {
      missing.push(name);
      continue;
    }
    if (recorded[name] !== current(name)) {
      problems.push(
        `${name}: its sources changed after its shot; retake it (node scripts/gpui-shots.mjs on macOS).`
      );
    }
  }
  if (missing.length > 0 && strict) {
    problems.push(`No shot yet for ${missing.join(", ")}.`);
  }
  return { missing, problems };
};

/** One item as served at /r/gpui/<name>.json, its files' content inlined. */
export const builtItem = (item, read) => ({
  $schema: SCHEMA_ITEM,
  ...item,
  files: item.files.map((file) => ({ ...file, content: read(file.path) })),
});

export const json = (value) => `${JSON.stringify(value, null, 2)}\n`;
