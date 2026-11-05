import { ThemeSwitch } from "fumadocs-ui/layouts/shared/slots/theme-switch";

import { GitHubStarsLink } from "@/components/docs/github-stars-link";

/** Docs sidebar footer: GitHub on the left, light/dark on the right. Videorc has one palette. */
export const SidebarControls = () => (
  <div className="flex flex-1 items-center gap-1">
    <GitHubStarsLink />
    <ThemeSwitch className="ms-auto rounded-none border-y-0 border-e-0 px-1 py-0 *:rounded-md" />
  </div>
);
