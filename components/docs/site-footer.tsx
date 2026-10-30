import Link from "next/link";

import { siteConfig } from "@/lib/site";

const FOOTER_LINK_CLASS =
  "text-muted-foreground underline-offset-4 hover:text-foreground hover:underline";

export const SiteFooter = () => (
  <footer>
    <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-3 px-4 py-6 text-center sm:flex-row sm:px-6 sm:text-left">
      <p className="text-muted-foreground text-sm">
        The component library behind{" "}
        <a
          className="underline underline-offset-4"
          href={siteConfig.videorcUrl}
          rel="noopener noreferrer"
          target="_blank"
        >
          Videorc
        </a>
        . Built by{" "}
        <a
          className="underline underline-offset-4"
          href="https://x.com/orcdev"
          rel="noopener noreferrer"
          target="_blank"
        >
          orcdev
        </a>
        .
      </p>
      <nav
        aria-label="Secondary"
        className="flex flex-wrap items-center gap-4 text-sm"
      >
        <Link className={FOOTER_LINK_CLASS} href="/llms.txt">
          llms.txt
        </Link>
        <a
          className={FOOTER_LINK_CLASS}
          href={siteConfig.videorcUrl}
          rel="noopener noreferrer"
          target="_blank"
        >
          videorc.com
        </a>
      </nav>
    </div>
  </footer>
);
