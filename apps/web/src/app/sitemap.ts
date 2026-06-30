import type { MetadataRoute } from "next";
import { getAppOrigin } from "@/lib/urls";

export default function sitemap(): MetadataRoute.Sitemap {
  const origin = getAppOrigin();
  if (!origin) return [];

  const now = new Date();
  return [
    { url: origin, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${origin}/login`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
    { url: `${origin}/register`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
  ];
}
