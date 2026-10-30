import { siteConfig } from "@/lib/site";
import socialImages from "@/lib/social-images.json";
import type { SocialImage } from "@/lib/social-metadata";

/** Structured data for search engines: schema.org types, in JSON-LD. */
export type JsonLd = Record<string, unknown>;

export interface Crumb {
  name: string;
  pathname: string;
}

const images: Record<string, SocialImage | undefined> = socialImages;
const absolute = (pathname: string): string =>
  pathname === "/" ? siteConfig.url : new URL(pathname, siteConfig.url).href;

const website = {
  "@type": "WebSite",
  description: siteConfig.description,
  name: siteConfig.name,
  url: siteConfig.url,
} as const;

export const websiteJsonLd = (): JsonLd => ({
  "@context": "https://schema.org",
  ...website,
});

/**
 * The trail to a docs page: Docs, then each level that is a page of its own.
 * `/docs/concepts` has none, so a concept's trail is Docs › the concept.
 */
export const docsCrumbs = (
  pathname: string,
  titleFor: (pathname: string) => string | undefined
): Crumb[] => {
  const segments = pathname.split("/").filter(Boolean);
  return [
    { name: "Docs", pathname: "/docs" },
    ...segments.slice(1).flatMap((_, index) => {
      const path = `/${segments.slice(0, index + 2).join("/")}`;
      const name = titleFor(path);
      return name ? [{ name, pathname: path }] : [];
    }),
  ];
};

/** A docs page: an article in the site, and where it sits in the docs. */
export const docsPageJsonLd = ({
  crumbs,
  description,
  pathname,
  title,
}: {
  crumbs: Crumb[];
  description?: string;
  pathname: string;
  title: string;
}): JsonLd => {
  const image = images[pathname];
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "TechArticle",
        description,
        headline: title,
        image: image ? absolute(image.url) : undefined,
        isPartOf: website,
        url: absolute(pathname),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: crumbs.map((crumb, index) => ({
          "@type": "ListItem",
          item: absolute(crumb.pathname),
          name: crumb.name,
          position: index + 1,
        })),
      },
    ],
  };
};

/** JSON for a script tag: `<` is escaped, so no string can close the tag. */
export const serializeJsonLd = (data: JsonLd): string =>
  JSON.stringify(data).replaceAll("<", "\\u003c");
