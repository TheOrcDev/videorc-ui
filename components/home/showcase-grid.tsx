import { ShowcaseCard } from "@/components/home/showcase-card";
import { cn } from "@/lib/utils";

interface ShowcaseItem {
  example: string;
  label: string;
  href: string;
}

const WIDE: ShowcaseItem[] = [
  {
    example: "command-demo",
    href: "/docs/components/command",
    label: "⌘K palette",
  },
  {
    example: "window-frame-demo",
    href: "/docs/primitives/window-frame",
    label: "Window frame",
  },
  {
    example: "list-row-controls",
    href: "/docs/primitives/list-row",
    label: "Grouped list",
  },
  {
    example: "status-bar-demo",
    href: "/docs/primitives/status-bar",
    label: "Status bar",
  },
];

const LEFT: ShowcaseItem[] = [
  { example: "button-demo", href: "/docs/components/button", label: "Buttons" },
  {
    example: "segmented-control-demo",
    href: "/docs/components/segmented-control",
    label: "Segmented control",
  },
  {
    example: "badge-status",
    href: "/docs/components/badge",
    label: "Status chips",
  },
  {
    example: "shortcut-keys-demo",
    href: "/docs/components/shortcut-keys",
    label: "Shortcut keys",
  },
  {
    example: "toggle-group-filters",
    href: "/docs/components/toggle-group",
    label: "Filter chips",
  },
];

const RIGHT: ShowcaseItem[] = [
  {
    example: "device-picker-demo",
    href: "/docs/primitives/device-picker",
    label: "Device picker",
  },
  { example: "fader-gain", href: "/docs/components/fader", label: "Fader" },
  {
    example: "field-settings-row",
    href: "/docs/components/field",
    label: "Settings rows",
  },
  {
    example: "power-slider-demo",
    href: "/docs/primitives/power-slider",
    label: "Power slider",
  },
  {
    example: "confirm-dialog-demo",
    href: "/docs/primitives/confirm-dialog",
    label: "Confirm dialog",
  },
];

const Column = ({
  items,
  className,
}: {
  items: ShowcaseItem[];
  className?: string;
}) => (
  <div className={cn("flex min-w-0 flex-col gap-4", className)}>
    {items.map((item) => (
      <ShowcaseCard
        example={item.example}
        href={item.href}
        key={item.example}
        label={item.label}
      />
    ))}
  </div>
);

/**
 * Three stacks of live tiles: narrow, wide, narrow on desktop. The wide stack
 * comes first in the markup, so phones and tablets show the palette first.
 */
export const ShowcaseGrid = () => (
  <section
    aria-label="Live components"
    className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4"
  >
    <Column className="md:col-span-2 lg:order-2" items={WIDE} />
    <Column className="lg:order-1" items={LEFT} />
    <Column className="lg:order-3" items={RIGHT} />
  </section>
);
