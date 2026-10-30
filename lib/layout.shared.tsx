import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";

import {
  DocsBrandNavTitle,
  HomeBrandNavTitle,
} from "@/components/brand-nav-title";
import { SidebarControls } from "@/components/docs/sidebar-controls";

interface BaseOptionsConfig {
  /**
   * Docs layout: drop the Docs link (the sidebar is the docs) and move the
   * light/dark switch into the sidebar footer. Default false.
   */
  docs?: boolean;
}

export const baseOptions = ({
  docs = false,
}: BaseOptionsConfig = {}): BaseLayoutProps => ({
  links: [
    ...(docs
      ? []
      : [{ active: "nested-url", text: "Docs", url: "/docs" } as const]),
    { active: "nested-url", text: "Components", url: "/docs/components" },
    { active: "nested-url", text: "Primitives", url: "/docs/primitives" },
  ],
  slots: { navTitle: docs ? DocsBrandNavTitle : HomeBrandNavTitle },
  ...(docs && { themeSwitch: { component: <SidebarControls /> } }),
});
