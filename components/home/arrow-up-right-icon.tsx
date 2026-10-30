import { ArrowUpRightIcon as PhosphorArrowUpRight } from "@phosphor-icons/react/ssr";

/** The site's own arrow, server-rendered; registry components use @/components/icons. */
export const ArrowUpRightIcon = ({ className }: { className?: string }) => (
  <PhosphorArrowUpRight aria-hidden className={className} />
);
