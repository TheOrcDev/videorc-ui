import { defineConfig } from "oxlint";
import core from "ultracite/oxlint/core";
import next from "ultracite/oxlint/next";
import react from "ultracite/oxlint/react";
import shadcn from "ultracite/oxlint/shadcn";

/**
 * Code Block Command and its dependencies, from chanhdai.com's registry by way
 * of audiocn. They stay as upstream writes them.
 */
const NCDAI_FILES = [
  "components/code-block-command.tsx",
  "components/copy-button.tsx",
  "components/icon-swap.tsx",
  "components/tabs.tsx",
  "hooks/use-copy-to-clipboard.ts",
];

export default defineConfig({
  env: core.env,
  extends: [core, react, next, shadcn],
  ignorePatterns: [
    ...(core.ignorePatterns ?? []),
    // Agent skills are vendored from upstream and managed by skills-lock.json
    "**/.agents/skills",
    "**/.claude/skills",
    ".source/**",
    "public/r/**",
  ],
  jsPlugins: shadcn.jsPlugins,
  overrides: [
    {
      files: ["**/*.{ts,tsx}"],
      rules: {
        // `not-prose` is Tailwind Typography's escape hatch (Fumadocs ships
        // it), and `toaster` is sonner's hook class.
        "shadcn/no-unknown-classes": [
          "error",
          { allow: ["not-prose", "toaster"] },
        ],
      },
    },
    {
      // Open Graph cards are drawn by Satori, which takes inline styles only.
      files: ["app/**/opengraph-image.tsx"],
      rules: {
        "shadcn/no-inline-styles": "off",
      },
    },
    {
      files: NCDAI_FILES,
      rules: {
        "eslint/func-style": "off",
        "eslint/no-use-before-define": "off",
        "eslint/sort-keys": "off",
        "react/function-component-definition": "off",
        "react/memo-dependencies": "off",
        "react/todo": "off",
        "shadcn/no-arbitrary-values": "off",
        "shadcn/no-raw-colors": "off",
        "shadcn/no-restyle": "off",
      },
    },
    {
      // Registry code installs into any React app (Videorc is Vite and
      // Electron), so it never depends on Next.js. Composite widgets handle
      // keys on their container and expose ARIA roles where no native element
      // fits.
      // Registry components keep shadcn's own shape (function declarations,
      // one export list at the end), so a diff against upstream reads cleanly.
      files: ["components/ui/**", "components/*.tsx"],
      rules: {
        "eslint/func-style": "off",
        "eslint/no-use-before-define": "off",
        "jsx-a11y/no-noninteractive-element-interactions": "off",
        "jsx-a11y/prefer-tag-over-role": "off",
        "nextjs/no-img-element": "off",
        "react/function-component-definition": "off",
      },
    },
  ],
});
