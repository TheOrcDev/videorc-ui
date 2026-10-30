// Adds or replaces registry items from a JSON file: node scripts/add-items.mjs items.json
// Items keep registry.json's order; new ones are appended, or inserted after
// `--after <name>` when given.
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";

const [file] = process.argv.slice(2);
const afterIndex = process.argv.indexOf("--after");
const after = afterIndex === -1 ? undefined : process.argv[afterIndex + 1];
const incoming = JSON.parse(readFileSync(file, "utf-8"));
const registry = JSON.parse(readFileSync("registry.json", "utf-8"));

for (const item of incoming) {
  const existing = registry.items.findIndex(
    (entry) => entry.name === item.name
  );
  if (existing === -1) {
    const anchor = after
      ? registry.items.findIndex((entry) => entry.name === after)
      : -1;
    if (anchor === -1) {
      registry.items.push(item);
    } else {
      registry.items.splice(anchor + 1, 0, item);
    }
  } else {
    registry.items[existing] = { ...registry.items[existing], ...item };
  }
}

writeFileSync("registry.json", `${JSON.stringify(registry, null, 2)}\n`);
execFileSync("pnpm", ["exec", "oxfmt", "registry.json"]);
console.log(`registry.json: ${registry.items.length} items`);
