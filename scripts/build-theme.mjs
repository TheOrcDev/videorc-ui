import { execFileSync } from "node:child_process";
// Builds the registry's `theme` and `desktop` items from the stylesheets in
// styles/. The CSS files are the source of truth (comments and all); the
// shadcn CLI installs CSS through an item's `cssVars` and `css`, so this
// script converts one into the other and writes them into registry.json.
//
//   node scripts/build-theme.mjs          rewrite registry.json
//   node scripts/build-theme.mjs --check  fail if registry.json is stale
import { readFileSync, writeFileSync } from "node:fs";

import { parse } from "postcss";

const REGISTRY = "registry.json";
const SOURCES = [
  { file: "styles/videorc.css", item: "theme" },
  { file: "styles/desktop.css", item: "desktop" },
];

const WHITESPACE = /\s+/gu;
const OPEN_PAREN_SPACE = /\(\s+/gu;
const CLOSE_PAREN_SPACE = /\s+\)/gu;
const clean = (value) =>
  value
    .replaceAll(WHITESPACE, " ")
    .replaceAll(OPEN_PAREN_SPACE, "(")
    .replaceAll(CLOSE_PAREN_SPACE, ")")
    .trim();

const toObject = (container) => {
  const out = {};
  for (const node of container.nodes ?? []) {
    if (node.type === "decl") {
      out[node.prop] = clean(
        node.important ? `${node.value} !important` : node.value
      );
    } else if (node.type === "rule") {
      out[clean(node.selector)] = toObject(node);
    } else if (node.type === "atrule" && node.name === "apply") {
      out[`@apply ${clean(node.params)}`] = {};
    } else if (node.type === "atrule") {
      out[clean(`@${node.name} ${node.params}`)] = toObject(node);
    }
  }
  return out;
};

const assignVars = (target, rule) => {
  for (const node of rule.nodes ?? []) {
    if (node.type === "decl") {
      target[node.prop.replace(/^--/u, "")] = clean(node.value);
    } else if (node.type !== "comment") {
      throw new Error(`Only declarations may sit in ${rule.selector}`);
    }
  }
};

const convert = (file) => {
  const root = parse(readFileSync(file, "utf-8"), { from: file });
  const cssVars = { dark: {}, light: {}, theme: {} };
  const css = {};

  for (const node of root.nodes) {
    if (node.type === "comment") {
      continue;
    }
    if (node.type === "rule") {
      const selector = clean(node.selector);
      if (selector === ":root") {
        assignVars(cssVars.light, node);
      } else if (selector === ".dark") {
        assignVars(cssVars.dark, node);
      } else if (selector === ":root, .dark") {
        assignVars(cssVars.light, node);
        assignVars(cssVars.dark, node);
      } else {
        css[selector] = { ...css[selector], ...toObject(node) };
      }
      continue;
    }
    if (node.type === "atrule") {
      if (node.name === "theme") {
        for (const decl of node.nodes ?? []) {
          if (decl.type === "decl") {
            cssVars.theme[decl.prop.replace(/^--/u, "")] = clean(decl.value);
          }
        }
        continue;
      }
      if (node.name === "custom-variant" || node.name === "import") {
        throw new Error(
          `${file}: @${node.name} cannot ship through a registry item`
        );
      }
      const key = clean(`@${node.name} ${node.params}`);
      css[key] = { ...css[key], ...toObject(node) };
    }
  }

  const result = {};
  const hasVars = Object.values(cssVars).some((v) => Object.keys(v).length > 0);
  if (hasVars) {
    result.cssVars = cssVars;
  }
  if (Object.keys(css).length > 0) {
    result.css = css;
  }
  return result;
};

const registry = JSON.parse(readFileSync(REGISTRY, "utf-8"));
for (const { file, item: name } of SOURCES) {
  const item = registry.items.find((entry) => entry.name === name);
  if (!item) {
    throw new Error(`registry.json has no "${name}" item`);
  }
  delete item.cssVars;
  delete item.css;
  Object.assign(item, convert(file));
}

const next = `${JSON.stringify(registry, null, 2)}\n`;
const formatted = execFileSync(
  "pnpm",
  ["exec", "oxfmt", "--stdin-filepath", REGISTRY],
  { encoding: "utf-8", input: next }
);

if (process.argv.includes("--check")) {
  if (formatted !== readFileSync(REGISTRY, "utf-8")) {
    console.error("registry.json is stale: run `pnpm theme:build`.");
    process.exit(1);
  }
} else {
  writeFileSync(REGISTRY, formatted);
}
