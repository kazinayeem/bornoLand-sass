import type { MetadataRoute } from "next";
import { getAppOrigin } from "@/lib/urls";

export default function robots(): MetadataRoute.Robots {
  const origin = getAppOrigin();
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/dashboard", "/store", "/api"],
    },
    sitemap: origin ? `${origin}/sitemap.xml` : "/sitemap.xml",
  };
}
