/* oxlint-disable eslint/no-await-in-loop -- Capture sequentially so Next dev and the browser keep a bounded memory footprint. */
// Captures a 1200 × 630 social image of every public page. See public/og/README.md.
//
//   pnpm og:build                  every card; updates lib/social-images.json
//   pnpm og:build --verify         capture each card twice; fail unless identical
//   pnpm og:build --only a,b       just these card ids; the rest stay as they are
//   pnpm og:build --draft          write PNGs to a temp folder; touch nothing
import { spawn, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { once } from "node:events";
import { mkdir, mkdtemp, readFile, unlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { setTimeout as delay } from "node:timers/promises";

import { chromium } from "@playwright/test";

const root = process.cwd();
const outputDirectory = path.join(root, "public/og");
const manifestPath = path.join(root, "lib/social-images.json");
const port = Number(process.env.VIDEORC_UI_SOCIAL_PORT ?? 3157);
const verify = process.argv.includes("--verify");
const draft = process.argv.includes("--draft");
const onlyArg = process.argv[process.argv.indexOf("--only") + 1];
const only = process.argv.includes("--only")
  ? new Set(onlyArg?.split(","))
  : null;
if (!Number.isInteger(port) || port < 1024 || port > 65_535) {
  throw new Error(
    "VIDEORC_UI_SOCIAL_PORT must be a port between 1024 and 65535."
  );
}

// Laid out at 800 × 420 and shot at 1.5×: the whole page scales, popups too.
const LAYOUT = { height: 420, width: 800 };
const SCALE = 1.5;
const IMAGE = { height: LAYOUT.height * SCALE, width: LAYOUT.width * SCALE };
const IMAGE_BUDGET_BYTES = 1_500_000;
// Long enough for tooltip delays and popup transitions to settle.
const SETTLE_MS = 1600;
const TRIGGER = '[data-slot$="-trigger"]';

const examples = spawnSync(process.execPath, ["scripts/build-examples.mjs"], {
  cwd: root,
  stdio: "inherit",
});
if (examples.status !== 0) {
  throw new Error("Could not build the example registry.");
}

const baseUrl = `http://127.0.0.1:${port}`;
const server = spawn(
  process.execPath,
  [
    "node_modules/next/dist/bin/next",
    "dev",
    "--hostname",
    "127.0.0.1",
    "--port",
    String(port),
  ],
  {
    cwd: root,
    env: { ...process.env, VIDEORC_UI_SOCIAL_CAPTURE: "1" },
    stdio: ["ignore", "pipe", "pipe"],
  }
);
let serverLog = "";
const collectLog = (chunk) => {
  serverLog = `${serverLog}${chunk.toString()}`.slice(-8000);
};
server.stdout.on("data", collectLog);
server.stderr.on("data", collectLog);
let browser;

const waitForServer = async () => {
  const deadline = Date.now() + 120_000;
  while (Date.now() < deadline) {
    if (server.exitCode !== null) {
      throw new Error(`Social capture server exited.\n${serverLog}`);
    }
    try {
      const response = await fetch(`${baseUrl}/api/social-cards`, {
        signal: AbortSignal.timeout(5000),
      });
      if (response.ok) {
        // Compile the capture page once, before the clock-paused visits.
        await fetch(`${baseUrl}/social-preview/home`);
        return;
      }
    } catch {
      // The server may still be starting or compiling the route.
    }
    await delay(300);
  }
  throw new Error(`Social capture server did not become ready.\n${serverLog}`);
};

const openPopup = async (page, card, open) => {
  const target = page
    .locator(`[data-social-preview="${card.preview}"]`)
    .locator(open.target ?? TRIGGER)
    .first();
  // `force`: the paused clock stops the animation frames actionability waits on.
  await (open.action === "hover"
    ? target.hover({ force: true })
    : target.click({
        button: open.action === "contextmenu" ? "right" : "left",
        force: true,
      }));
};

const capture = async (card, options) => {
  const context = await browser.newContext({
    colorScheme: "dark",
    deviceScaleFactor: SCALE,
    locale: "en-US",
    viewport: LAYOUT,
  });
  try {
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => {
      if (message.type() === "error") {
        errors.push(message.text());
      }
    });
    // Pause before navigation: every clock and timer starts at the same frame.
    await page.clock.install({ time: new Date("2026-01-01T20:42:00Z") });
    await page.clock.pauseAt(new Date("2026-01-01T20:42:01Z"));
    await page.goto(`${baseUrl}/social-preview/${card.id}`, {
      timeout: 120_000,
      waitUntil: "load",
    });
    await page.locator('[data-social-ready="true"]').waitFor();
    await page
      .locator(`[data-social-preview="${card.preview}"] > *`)
      .first()
      .waitFor();
    // Compositions load several demos; dev keeps a socket open, so cap the wait.
    await page
      .waitForLoadState("networkidle", { timeout: 10_000 })
      .catch(() => {
        // Dev holds a socket open, so the network never goes idle for good.
      });
    await page.evaluate(async () => {
      await document.fonts.ready;
      await Promise.all(Array.from(document.images, (image) => image.decode()));
    });
    // Force a layout and paint before the clock moves on.
    await page
      .locator("[data-social-card]")
      .screenshot({ animations: "disabled" });
    if (options?.open) {
      await openPopup(page, card, options.open);
    }
    await page.clock.runFor(SETTLE_MS);
    if (errors.length > 0 && !options?.crashes) {
      throw new Error(`${card.id} failed to render: ${errors.join("; ")}`);
    }
    const bytes = await page.locator("[data-social-card]").screenshot({
      animations: "disabled",
      caret: "hide",
      scale: "device",
    });
    if (
      bytes.readUInt32BE(16) !== IMAGE.width ||
      bytes.readUInt32BE(20) !== IMAGE.height
    ) {
      throw new Error(`${card.id} did not render at 1200 × 630.`);
    }
    if (bytes.length > IMAGE_BUDGET_BYTES) {
      throw new Error(`${card.id} exceeds the image budget.`);
    }
    const hash = createHash("sha256").update(bytes).digest("hex").slice(0, 12);
    return { bytes, card, filename: `${card.id}-${hash}.png` };
  } finally {
    await context.close();
  }
};

// Next dev reloads a page whose chunks it compiled mid-visit; the retry is warm.
const RELOADED = /Execution context was destroyed|navigation|detached/u;
const ATTEMPTS = 3;
const captureWarm = async (card, options, attempt = 1) => {
  try {
    return await capture(card, options);
  } catch (error) {
    if (attempt < ATTEMPTS && RELOADED.test(error.message)) {
      return captureWarm(card, options, attempt + 1);
    }
    throw error;
  }
};

try {
  await waitForServer();
  const catalogResponse = await fetch(`${baseUrl}/api/social-cards`);
  if (!catalogResponse.ok) {
    throw new Error("Could not read the social card catalog.");
  }
  const { cards, previewOptions } = await catalogResponse.json();
  if (!Array.isArray(cards) || cards.length === 0) {
    throw new Error("The social card catalog is empty or invalid.");
  }
  const selected = only ? cards.filter((card) => only.has(card.id)) : cards;
  if (only && selected.length !== only.size) {
    throw new Error(`Unknown card ids in --only ${onlyArg}.`);
  }
  // Playwright's own Chromium: the system Chrome can run under Rosetta here.
  // Software rasterization keeps antialiasing identical across captures.
  browser = await chromium.launch({
    args: [
      "--disable-accelerated-2d-canvas",
      "--disable-gpu",
      "--deterministic-mode",
      "--run-all-compositor-stages-before-draw",
      "--disable-threaded-animation",
      "--disable-threaded-scrolling",
    ],
  });
  const captures = [];
  for (const card of selected) {
    const options = previewOptions[card.preview];
    const result = await captureWarm(card, options);
    if (verify) {
      const repeated = await captureWarm(card, options);
      if (!result.bytes.equals(repeated.bytes)) {
        const failureDirectory = await mkdtemp(
          path.join(tmpdir(), "videorc-ui-og-")
        );
        await writeFile(
          path.join(failureDirectory, `${card.id}-first.png`),
          result.bytes
        );
        await writeFile(
          path.join(failureDirectory, `${card.id}-repeat.png`),
          repeated.bytes
        );
        throw new Error(
          `${card.id} changed between two identical captures. Compare the PNGs in ${failureDirectory}.`
        );
      }
    }
    captures.push(result);
    console.log(
      `social image: ${card.id} (${captures.length}/${selected.length})${verify ? " — verified identical" : ""}`
    );
  }
  if (draft) {
    const draftDirectory = await mkdtemp(path.join(tmpdir(), "videorc-ui-og-"));
    for (const { bytes, card } of captures) {
      await writeFile(path.join(draftDirectory, `${card.id}.png`), bytes);
    }
    console.log(
      `Drafted ${captures.length} social images in ${draftDirectory}`
    );
  } else {
    const previous = JSON.parse(
      await readFile(manifestPath, "utf-8").catch(() => "{}")
    );
    // A partial run keeps every other card's entry.
    const manifest = only ? { ...previous } : {};
    await mkdir(outputDirectory, { recursive: true });
    for (const { bytes, card, filename } of captures) {
      await writeFile(path.join(outputDirectory, filename), bytes);
      manifest[card.pathname] = { alt: card.alt, url: `/og/${filename}` };
    }
    const sorted = Object.fromEntries(
      Object.entries(manifest).toSorted(([a], [b]) => a.localeCompare(b))
    );
    await writeFile(manifestPath, `${JSON.stringify(sorted, null, 2)}\n`);
    // Only remove assets owned by the previous manifest, after all captures succeed.
    const currentUrls = new Set(
      Object.values(sorted).map((image) => image.url)
    );
    for (const image of Object.values(previous)) {
      if (
        /^\/og\/[a-z0-9-]+\.png$/u.test(image.url) &&
        !currentUrls.has(image.url)
      ) {
        await unlink(path.join(root, "public", image.url.slice(1))).catch(
          (error) => {
            if (error.code !== "ENOENT") {
              throw error;
            }
          }
        );
      }
    }
    console.log(`Saved ${captures.length} social images and their manifest.`);
  }
} finally {
  await browser?.close();
  if (server.exitCode === null) {
    const stopped = once(server, "exit");
    server.kill("SIGTERM");
    await stopped;
  }
}
