// Builds the GPUI flavour's registry (Videorc plan 260, S2.2b).
//
// registry-gpui.json names each item, its title, description and files;
// this script computes the rest from the sources (scripts/lib/gpui-registry.mjs)
// and writes it back, then builds public/r/gpui/<item>.json in the shadcn
// item shape with each file's content, served at
// https://ui.videorc.com/r/gpui/<item>.json for `pnpm ui:sync --flavour gpui`
// in Videorc. It needs no dependencies, so it runs anywhere Node does.
//
//   node scripts/build-gpui-registry.mjs          complete registry-gpui.json, build public/r/gpui
//   node scripts/build-gpui-registry.mjs --check  fail if registry-gpui.json is stale, an item
//                                                 breaks the twin check, or a kit file is in no item
import { mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";

import {
  builtItem,
  completeIndex,
  indexProblems,
  json,
  parseWorkspaceCargo,
  twinProblems,
} from "./lib/gpui-registry.mjs";

const INDEX = "registry-gpui.json";
const REACT_INDEX = "registry.json";
const CARGO = "gpui/Cargo.toml";
const KIT_SRC = "gpui/kit/src";
const OUT = "public/r/gpui";

const read = (file) => readFileSync(file, "utf-8");
const check = process.argv.includes("--check");

const index = JSON.parse(read(INDEX));
const kitModules = readdirSync(KIT_SRC)
  .filter((file) => file.endsWith(".rs"))
  .map((file) => file.slice(0, -".rs".length));
const problems = indexProblems(index, kitModules);

const cargo = parseWorkspaceCargo(read(CARGO));
const completed = completeIndex(index, { cargo, read });
problems.push(...completed.problems);

const reactItems = new Map(
  JSON.parse(read(REACT_INDEX)).items.map((item) => [item.name, item])
);
for (const item of completed.index.items) {
  const reactItem = reactItems.get(item.name);
  // A React item's variants may live in a `-variants` sibling (tabs).
  const reactFiles = [reactItem, reactItems.get(`${item.name}-variants`)]
    .filter(Boolean)
    .flatMap((entry) => entry.files ?? [])
    .map((file) => file.path);
  problems.push(
    ...twinProblems({
      name: item.name,
      reactItem,
      reactSources: reactFiles.map(read),
      rustSources: item.files
        .filter((file) => file.path.endsWith(".rs"))
        .map((file) => read(file.path)),
    })
  );
}

const next = json(completed.index);
if (check) {
  if (read(INDEX) !== next) {
    problems.push(
      `${INDEX} is stale: run node scripts/build-gpui-registry.mjs and commit it.`
    );
  }
  if (problems.length > 0) {
    console.error(`gpui registry check failed:\n\n${problems.join("\n")}`);
    process.exit(1);
  }
  console.log(
    `gpui registry OK: ${completed.index.items.length} items, every kit module shipped, twins match.`
  );
} else {
  writeFileSync(INDEX, next);
  rmSync(OUT, { force: true, recursive: true });
  mkdirSync(OUT, { recursive: true });
  for (const item of completed.index.items) {
    writeFileSync(path.join(OUT, `${item.name}.json`), json(builtItem(item, read)));
  }
  // The index, as shadcn build serves registry.json: every item, no content.
  writeFileSync(path.join(OUT, "registry.json"), next);
  console.log(
    `${INDEX}: ${completed.index.items.length} items; ${OUT}/ written.`
  );
  if (problems.length > 0) {
    console.error(`\nFix before committing:\n\n${problems.join("\n")}`);
    process.exitCode = 1;
  }
}
