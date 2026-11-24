// The GPUI items' gallery shots for the docs' GPUI tab (Videorc plan 260,
// S2.2b): public/gpui/shots/<item>-dark.png and <item>-light.png, and
// manifest.json, which records a hash of the sources each shot was taken
// from (the item's files, its dependencies' and its gallery page).
//
//   node scripts/gpui-shots.mjs                    take every shot (builds the gallery with
//                                                  --features shots; macOS or Windows)
//   node scripts/gpui-shots.mjs --check            fail when an item changed after its shot
//   node scripts/gpui-shots.mjs --check --strict   also fail when an item has no shot
//
// Vercel never builds Rust, so the shots are taken on a runner and committed
// (.github/workflows/gpui.yml, the shots job).
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import {
  galleryPages,
  json,
  shotProblems,
  shotSources,
} from "./lib/gpui-registry.mjs";

const INDEX = "registry-gpui.json";
const GALLERY_MAIN = "gpui/gallery/src/main.rs";
const SHOTS = "public/gpui/shots";
const MANIFEST = path.join(SHOTS, "manifest.json");
const APPEARANCES = ["dark", "light"];

const read = (file) => readFileSync(file, "utf-8");
const index = JSON.parse(read(INDEX));
const pages = galleryPages(read(GALLERY_MAIN));
const items = index.items.map((item) => item.name).filter((name) => pages[name]);

const sourceHash = (name) => {
  const hash = createHash("sha256");
  for (const file of shotSources(index, name, pages)) {
    hash.update(`${file}\0`);
    hash.update(readFileSync(file));
    hash.update("\0");
  }
  return hash.digest("hex");
};

const shotPath = (name, appearance) =>
  path.join(SHOTS, `${name}-${appearance}.png`);
const hasShots = (name) =>
  APPEARANCES.every((appearance) => existsSync(shotPath(name, appearance)));

if (process.argv.includes("--check")) {
  const recorded = existsSync(MANIFEST) ? JSON.parse(read(MANIFEST)).items ?? {} : {};
  const { missing, problems } = shotProblems({
    current: sourceHash,
    items,
    present: hasShots,
    recorded,
    strict: process.argv.includes("--strict"),
  });
  const without = index.items
    .map((item) => item.name)
    .filter((name) => !pages[name]);
  if (problems.length > 0) {
    console.error(`gpui shots check failed:\n\n${problems.join("\n")}`);
    process.exit(1);
  }
  console.log(
    `gpui shots OK: ${items.length - missing.length} of ${items.length} items shot and current` +
      `${missing.length > 0 ? `; no shot yet: ${missing.join(", ")}` : ""}` +
      `${without.length > 0 ? `; no gallery page: ${without.join(", ")}` : ""}.`
  );
} else {
  const cargo = spawnSync(
    "cargo",
    [
      "run",
      "-p",
      "videorc-gallery",
      "--features",
      "shots",
      "--locked",
      "--",
      "--shots",
      path.resolve(SHOTS),
    ],
    { cwd: "gpui", stdio: "inherit" }
  );
  if (cargo.error || cargo.status !== 0) {
    console.error(
      `The gallery's shots failed (${cargo.error?.message ?? `exit ${cargo.status}`}).`
    );
    process.exit(1);
  }
  const taken = Object.fromEntries(
    items.filter(hasShots).map((name) => [name, sourceHash(name)])
  );
  writeFileSync(MANIFEST, json({ items: taken }));
  console.log(`${MANIFEST}: ${Object.keys(taken).length} items.`);
}
