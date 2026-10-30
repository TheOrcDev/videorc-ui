import { defineConfig } from "oxfmt";
import ultracite from "ultracite/oxfmt";

export default defineConfig({
  ...ultracite,
  ignorePatterns: [
    ...(ultracite.ignorePatterns ?? []),
    // Agent skills are vendored from upstream and managed by skills-lock.json
    "**/.agents/skills",
    "**/.claude/skills",
    ".source/**",
    "public/r/**",
    "lib/hero-chrome/**",
    "components/home/hero-chrome.tsx",
    "test-results/**",
    "playwright-report/**",
  ],
});
