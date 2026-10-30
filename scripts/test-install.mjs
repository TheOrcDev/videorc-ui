// Installs every videorc/ui registry item into fresh shadcn apps and
// type-checks them. Run `pnpm registry:build` first.
//
// Two fixtures:
// - next: a Next.js Base UI app (rsc: true), the docs site's own shape.
// - vite: a Vite Base UI app (rsc: false) compiled against ES2022 and
//   formatted with Videorc's Prettier settings, the shape Videorc's renderer
//   installs into. "use client" stays in the files (the CLI keeps it even
//   for rsc: false); Vite ignores the directive, as Videorc's own files show.
//
// VIDEORC_UI_FIXTURE=next|vite runs one; VIDEORC_UI_FIXTURE_DIR keeps them.
// VIDEORC_UI_REGISTRY=https://ui.videorc.com/r/{name}.json installs from a
// deployed registry instead of this checkout's public/r.
import { spawn } from "node:child_process";
import { once } from "node:events";
import {
  createReadStream,
  existsSync,
  mkdtempSync,
  readFileSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import path from "node:path";

const root = process.cwd();
const registryDir = path.join(root, "public/r");
const port = 4999;

if (!existsSync(path.join(registryDir, "registry.json"))) {
  console.error("Run `pnpm registry:build` first.");
  process.exit(1);
}

const { items } = JSON.parse(
  readFileSync(path.join(root, "registry.json"), "utf-8")
);
const names = items.map((item) => item.name);

const fixtures = [
  { lib: null, name: "next", prettier: false, template: "next" },
  {
    lib: ["ES2022", "DOM", "DOM.Iterable"],
    name: "vite",
    prettier: true,
    template: "vite",
  },
];

// Videorc's prettier.config.cjs.
const VIDEORC_PRETTIER = {
  printWidth: 100,
  semi: false,
  singleQuote: true,
  trailingComma: "none",
};

const only = process.env.VIDEORC_UI_FIXTURE;

const server = createServer((request, response) => {
  const file = path.join(registryDir, path.basename(request.url ?? ""));
  if (!existsSync(file) || !statSync(file).isFile()) {
    response.writeHead(404).end();
    return;
  }
  response.writeHead(200, { "Content-Type": "application/json" });
  createReadStream(file).pipe(response);
});

server.listen(port);
await once(server, "listening");

// Async on purpose: the registry server shares this process, so a blocking
// spawn would stop it from answering the CLI.
const run = async (command, args, cwd) => {
  console.log(`$ ${command} ${args.join(" ")}`);
  const child = spawn(command, args, { cwd, stdio: "inherit" });
  const [code] = await once(child, "close");
  if (code !== 0) {
    throw new Error(`${command} ${args.join(" ")} failed with ${code}`);
  }
};

const BLOCK_COMMENT = /\/\*[\s\S]*?\*\//gu;
const LINE_COMMENT = /^\s*\/\/.*$/gmu;
const TRAILING_COMMA = /,(?=\s*[}\]])/gu;

/** Reads JSON with comments and trailing commas, as tsconfig files allow. */
const readJsonc = (file) =>
  JSON.parse(
    readFileSync(file, "utf-8")
      .replaceAll(BLOCK_COMMENT, "")
      .replaceAll(LINE_COMMENT, "")
      .replaceAll(TRAILING_COMMA, "")
  );

const editJson = (file, edit) => {
  const json = readJsonc(file);
  edit(json);
  writeFileSync(file, `${JSON.stringify(json, null, 2)}\n`);
};

const installFixture = async (fixture) => {
  const workspace = mkdtempSync(
    path.join(
      process.env.VIDEORC_UI_FIXTURE_DIR ?? tmpdir(),
      `videorc-ui-install-${fixture.name}-`
    )
  );
  const app = path.join(workspace, "fixture");

  await run(
    "pnpm",
    [
      "dlx",
      "shadcn@rc",
      "init",
      "--name",
      "fixture",
      "--template",
      fixture.template,
      "--base",
      "base",
      "--preset",
      "nova",
      "--yes",
    ],
    workspace
  );

  editJson(path.join(app, "components.json"), (config) => {
    config.registries = {
      ...config.registries,
      // The audiocn forks depend on audiocn's unchanged core and hooks.
      "@audiocn": "https://audiocn.dev/r/{name}.json",
      "@videorc":
        process.env.VIDEORC_UI_REGISTRY ??
        `http://localhost:${port}/{name}.json`,
    };
  });
  // Vite splits its config; the app's own sources compile under tsconfig.app.json.
  const tsconfig = existsSync(path.join(app, "tsconfig.app.json"))
    ? "tsconfig.app.json"
    : "tsconfig.json";
  if (fixture.lib) {
    editJson(path.join(app, tsconfig), (config) => {
      config.compilerOptions.lib = fixture.lib;
    });
  }

  await run(
    "pnpm",
    [
      "dlx",
      "shadcn@rc",
      "add",
      ...names.map((name) => `@videorc/${name}`),
      "--yes",
      "--overwrite",
    ],
    app
  );
  const { aliases } = JSON.parse(
    readFileSync(path.join(app, "components.json"), "utf-8")
  );
  const sourceRoot = aliases.ui.startsWith("@/")
    ? path.join(existsSync(path.join(app, "src")) ? "src" : ".", "components")
    : "components";
  if (fixture.prettier) {
    writeFileSync(
      path.join(app, ".prettierrc.json"),
      `${JSON.stringify(VIDEORC_PRETTIER, null, 2)}\n`
    );
    await run(
      "pnpm",
      ["dlx", "prettier@3", "--write", `${sourceRoot}/**/*.{ts,tsx}`],
      app
    );
  }
  await run("pnpm", ["exec", "tsc", "--noEmit", "-p", tsconfig], app);
  console.log(
    `\n[${fixture.name}] installed and type-checked ${names.length} items in ${app}`
  );
};

// One after the other: both fixtures use the same registry server and port.
const installInTurn = async ([next, ...rest]) => {
  if (!next) {
    return;
  }
  await installFixture(next);
  await installInTurn(rest);
};

const selected = fixtures.filter((fixture) => !only || only === fixture.name);
try {
  await installInTurn(selected);
} finally {
  server.close();
}
