import type { MetadataRoute } from "next";
import { destinations } from "@/lib/destinations";
import { siteConfig } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteConfig.url;
  const staticRoutes = [
    "",
    "/ride",
    "/airport",
    "/tours",
    "/destinations",
    "/safety",
    "/drive",
    "/partners",
    "/about",
    "/support",
    "/legal/privacy",
    "/legal/terms",
  ];

  const now = new Date();

  return [
    ...staticRoutes.map((path) => ({
      url: `${base}${path}`,
      lastModified: now,
      changeFrequency: path === "" ? ("weekly" as const) : ("monthly" as const),
      priority: path === "" ? 1 : 0.7,
    })),
    ...destinations.map((d) => ({
      url: `${base}/destinations/${d.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
