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
    // Written by scripts/build-gpui-registry.mjs, whose --check compares it byte for byte
    "registry-gpui.json",
    "lib/hero-chrome/**",
    "components/home/hero-chrome.tsx",
    "test-results/**",
    "playwright-report/**",
    // Zed's published crate, kept byte for byte beside its patch
    "gpui/patches/**",
    "gpui/target/**",
  ],
});
