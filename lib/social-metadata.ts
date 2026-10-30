import type { Metadata } from "next";

import { siteConfig } from "@/lib/site";
import socialImages from "@/lib/social-images.json";

export interface SocialImage {
  alt: string;
  url: string;
}

interface PageMetadataOptions {
  title: string;
  pathname: string;
  description?: string;
  image?: SocialImage;
}

// Captured by `pnpm og:build`: one card per page, the homepage's as fallback.
// Before the first capture there are none, and pages go without.
const images: Record<string, SocialImage | undefined> = socialImages;

export const getPageMetadata = ({
  title,
  pathname,
  description = siteConfig.description,
  image = images[pathname] ?? images["/"],
}: PageMetadataOptions): Metadata => {
  const fullTitle =
    pathname === "/" ? siteConfig.title : `${title} — ${siteConfig.name}`;
  const url =
    pathname === "/" ? siteConfig.url : new URL(pathname, siteConfig.url).href;
  const imageUrl = image ? new URL(image.url, siteConfig.url).href : "";

  return {
    alternates: { canonical: url },
    description,
    openGraph: {
      description,
      images: image
        ? [{ alt: image.alt, height: 630, url: imageUrl, width: 1200 }]
        : undefined,
      locale: "en_US",
      siteName: siteConfig.name,
      title: fullTitle,
      type: "website",
      url,
    },
    title: { absolute: fullTitle },
    twitter: {
      card: "summary_large_image",
      description,
      images: image ? [{ alt: image.alt, url: imageUrl }] : undefined,
      title: fullTitle,
    },
  };
};
