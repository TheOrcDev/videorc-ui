import { Analytics } from "@vercel/analytics/next";
import { RootProvider } from "fumadocs-ui/provider/next";
import type { Metadata } from "next";

import "./globals.css";
import {
  DocsSearchDialog,
  SearchGroupsProvider,
} from "@/components/docs/search-dialog";
import { SiteFooter } from "@/components/docs/site-footer";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { searchGroups } from "@/lib/search-groups";
import { siteConfig } from "@/lib/site";
import { getPageMetadata } from "@/lib/social-metadata";
import { source } from "@/lib/source";

const homeMetadata = getPageMetadata({ pathname: "/", title: siteConfig.name });

export const metadata: Metadata = {
  ...homeMetadata,
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.title,
    template: `%s — ${siteConfig.name}`,
  },
};

// Videorc draws in the system face (SF Pro on macOS), so the docs do too:
// the fonts come from the theme's --font-sans / --font-mono stacks.
const RootLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => (
  <html className="font-sans antialiased" lang="en" suppressHydrationWarning>
    <body className="flex min-h-svh flex-col">
      <ThemeProvider>
        <SearchGroupsProvider groups={searchGroups(source.getPageTree())}>
          <RootProvider
            search={{ SearchDialog: DocsSearchDialog }}
            theme={{ enabled: false }}
          >
            <TooltipProvider>
              <div className="flex min-h-0 flex-1 flex-col">{children}</div>
              <SiteFooter />
              <Toaster />
            </TooltipProvider>
          </RootProvider>
        </SearchGroupsProvider>
      </ThemeProvider>
      <Analytics />
    </body>
  </html>
);

export default RootLayout;
