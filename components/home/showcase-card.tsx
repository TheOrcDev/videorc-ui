import Link from "next/link";

import { ExampleRenderer } from "@/components/docs/example-renderer";
import { PreviewGround } from "@/components/docs/preview-ground";
import { ArrowUpRightIcon } from "@/components/home/arrow-up-right-icon";
import { cn } from "@/lib/utils";

interface ShowcaseCardProps {
  /** The name on the card. */
  label: string;
  /** The docs page the label links to. */
  href: string;
  /** The example the card runs, by its file name in components/examples. */
  example: string;
  className?: string;
}

/**
 * A showcase tile: a live example on the Liquid Chrome ground, under a label
 * that links to its docs. Only the label is a link, so every control in the
 * tile stays usable.
 */
export const ShowcaseCard = ({
  label,
  href,
  example,
  className,
}: ShowcaseCardProps) => (
  <article
    aria-label={label}
    className={cn(
      "rounded-panel flex min-w-0 flex-col overflow-hidden border",
      className
    )}
    data-slot="showcase-card"
  >
    <PreviewGround className="text-foreground flex min-w-0 flex-1 flex-col gap-4 p-4">
      <Link
        className="group/label text-subtle hover:text-foreground focus-visible:ring-ring/50 text-label -m-1 flex w-fit items-center gap-1 rounded-sm p-1 tracking-wider uppercase transition-colors outline-none focus-visible:ring-3"
        href={href}
      >
        {label}
        <span className="sr-only"> docs</span>
        <ArrowUpRightIcon className="size-3 transition-transform group-hover/label:translate-x-0.5 group-hover/label:-translate-y-0.5" />
      </Link>
      <div className="flex min-w-0 flex-1 flex-col items-center justify-center">
        <ExampleRenderer name={example} />
      </div>
    </PreviewGround>
  </article>
);
