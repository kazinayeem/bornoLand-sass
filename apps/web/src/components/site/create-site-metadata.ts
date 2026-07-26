import type { Metadata } from "next";

type SiteMetadataInput = {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
};

export function createSiteMetadata({
  title,
  description,
  path,
  keywords,
}: SiteMetadataInput): Metadata {
  const url = path.startsWith("/") ? path : `/${path}`;

  return {
    title,
    description,
    keywords,
    alternates: { canonical: url },
    openGraph: {
      title: `${title} | BornoLand`,
      description,
      url,
      siteName: "BornoLand",
      type: "website",
      images: [{ url: "/logo.png", width: 512, height: 512, alt: "BornoLand" }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | BornoLand`,
      description,
      images: ["/logo.png"],
    },
  };
}
