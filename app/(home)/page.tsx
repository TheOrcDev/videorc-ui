import type { Metadata } from "next";
import Link from "next/link";

import { InstallCommand } from "@/components/docs/install-command";
import { ArrowUpRightIcon } from "@/components/home/arrow-up-right-icon";
import { HeroChrome } from "@/components/home/hero-chrome";
import { ShowcaseGrid } from "@/components/home/showcase-grid";
import { ThemeSwatches } from "@/components/home/theme-swatches";
import { JsonLd } from "@/components/json-ld";
import { buttonVariants } from "@/components/ui/button";
import { websiteJsonLd } from "@/lib/json-ld";
import { siteConfig } from "@/lib/site";
import { getPageMetadata } from "@/lib/social-metadata";
import { source } from "@/lib/source";

export const metadata: Metadata = getPageMetadata({
  pathname: "/",
  title: siteConfig.name,
});

const itemCount = source
  .getPages()
  .filter(
    (page) =>
      (page.url.startsWith("/docs/components/") ||
        page.url.startsWith("/docs/primitives/") ||
        page.url.startsWith("/docs/blocks/")) &&
      page.url.split("/").length > 3
  ).length;

const Page = () => (
  <main className="w-full">
    <JsonLd data={websiteJsonLd()} />
    {/* Videorc's first-run chrome moves behind the hero and fades out
        before the showcase. */}
    <section className="relative isolate overflow-hidden px-4 pt-16 pb-24 sm:px-6 lg:pt-24 lg:pb-32">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 mask-b-from-50%"
      >
        <HeroChrome />
        <div className="hero-scrim absolute inset-0" />
      </div>
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-6 text-center">
        <Link
          className="text-muted-foreground hover:text-foreground glass-chip focus-visible:ring-ring/50 group/pill flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs transition-colors outline-none focus-visible:ring-3"
          href={siteConfig.videorcUrl}
          rel="noopener noreferrer"
          target="_blank"
        >
          The component library behind Videorc
          <ArrowUpRightIcon className="size-3 transition-transform group-hover/pill:translate-x-0.5 group-hover/pill:-translate-y-0.5" />
        </Link>
        <h1 className="font-heading max-w-4xl text-4xl font-semibold tracking-tight text-balance sm:text-6xl lg:text-7xl">
          Videorc&apos;s components, in your project.
        </h1>
        <p className="text-muted-foreground max-w-2xl text-base text-balance sm:text-lg">
          The buttons, menus, rows, panes and status bars of an AI-native
          recording studio. Base UI underneath, shadcn/ui on the surface, and
          every line yours.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link className={buttonVariants({ size: "lg" })} href="/docs">
            Get started
          </Link>
          <Link
            className={buttonVariants({ size: "lg", variant: "secondary" })}
            href="/docs/components"
          >
            Browse components
          </Link>
        </div>
        <div className="w-full max-w-md text-left">
          <InstallCommand
            command={`npx shadcn@latest add ${siteConfig.registryNamespace}/command`}
          />
        </div>
      </div>
    </section>
    <div className="mx-auto flex w-full max-w-7xl flex-col px-4 pb-24 sm:px-6">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-muted-foreground text-sm">
          Everything here is live. Open the palette, flip a switch, drag a
          fader.
        </p>
        <ThemeSwatches />
      </div>
      <ShowcaseGrid />
      <div className="mt-12 flex justify-center">
        <Link
          className={buttonVariants({ size: "lg", variant: "secondary" })}
          href="/docs/components"
        >
          Browse all {itemCount} components, primitives and blocks
        </Link>
      </div>
    </div>
  </main>
);

export default Page;
